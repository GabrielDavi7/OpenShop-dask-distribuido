import json
import time
import os
from dask.distributed import Client, as_completed

DIRETORIO_SCRIPT = os.path.dirname(os.path.abspath(__file__))
DIRETORIO_RAIZ = os.path.dirname(DIRETORIO_SCRIPT)
CAMINHO_JSON = os.path.join(DIRETORIO_RAIZ, "scripts", "resultados.json")

# 15 vizinhos por lote processado por cada thread
TAMANHO_LOTE = 15  

def executar_lote_vns(nome_instancia, inicio, fim): 
    import subprocess
    import os
    
    DIRETORIO_UNIVERSAL = r"C:\openshop"
    
    executavel = os.path.join(DIRETORIO_UNIVERSAL, "vns_worker.exe")
    caminho_instancia = os.path.join(DIRETORIO_UNIVERSAL, "instancias", nome_instancia)
    
    comando = [executavel, caminho_instancia, str(inicio), str(fim)]
    
    try:
        processo = subprocess.run(comando, capture_output=True, text=True, check=True, cwd=DIRETORIO_UNIVERSAL)
        makespan = None
        for linha in processo.stdout.split('\n'):
            if "MAKESPAN:" in linha:
                makespan = int(linha.split(":")[1].strip())
                break
        return makespan
    except Exception as e:
        print(f"Erro no worker ao processar lote {inicio}-{fim}: {e}")
        return float('inf')


def main():
    print("==========================================")
    print("Orquestrador Dask (Cluster)")
    print("==========================================\n")
    
    cliente = Client('tcp://26.166.53.48:8786')
    nos_ativos = sum(cliente.nthreads().values())
    
    print(f"-> Cluster Dask conectado com sucesso!")
    print(f"-> Threads (Nós Ativos) na força-tarefa: {nos_ativos}")
    print(f"-> Acompanhe o cluster no painel: {cliente.dashboard_link}\n")

    if not os.path.exists(CAMINHO_JSON):
        print(f"[ERRO CRÍTICO] O arquivo '{CAMINHO_JSON}' não foi encontrado.")
        print("Execute o 'gerar_base.py' primeiro para criar a estrutura de dados.")
        cliente.close()
        return

    with open(CAMINHO_JSON, "r", encoding="utf-8") as f:
        dados = json.load(f)

    print("Iniciando fatiamento e distribuição das instâncias...\n")

    for resultado in dados["resultados"]:
        instancia = resultado["instancia"]
        
        if resultado["maquina_isolada"]["melhor_makespan"] is None:
            continue
            
        if resultado["cluster_dask"]["melhor_makespan"] is not None:
            continue

        tamanho_total = resultado["tamanho_vizinhanca"]
        nome_arquivo = f"{instancia}Osp.psi"

        print(f"Fatiando {instancia} para o cluster ({tamanho_total} vizinhos)...")
        
        tempo_inicio = time.time()
        tarefas = []

        for inicio in range(0, tamanho_total, TAMANHO_LOTE):
            fim = min(inicio + TAMANHO_LOTE - 1, tamanho_total - 1)
            
            # Enviamos APENAS o nome do arquivo para o worker, pois ele já sabe buscar na C:\openshop
            tarefa = cliente.submit(executar_lote_vns, nome_arquivo, inicio, fim)
            tarefas.append(tarefa)

        melhor_makespan_cluster = float('inf')

        for tarefa_concluida in as_completed(tarefas):
            resultado_lote = tarefa_concluida.result()
            if resultado_lote is not None and resultado_lote < melhor_makespan_cluster:
                melhor_makespan_cluster = resultado_lote

        tempo_total = time.time() - tempo_inicio
        
        print(f"-> Concluído! Makespan: {melhor_makespan_cluster} | Tempo do Cluster: {tempo_total:.2f} s")

        resultado["cluster_dask"]["tempo_execucao_segundos"] = round(tempo_total, 2)
        resultado["cluster_dask"]["melhor_makespan"] = melhor_makespan_cluster
        resultado["cluster_dask"]["nos_ativos"] = nos_ativos
        
        tempo_single = resultado["maquina_isolada"]["tempo_execucao_segundos"]
        if tempo_single and tempo_total > 0:
            ganho = tempo_single / tempo_total
            resultado["ganho_desempenho_vezes"] = round(ganho, 2)
            print(f"-> Ganho de Desempenho: O cluster foi {ganho:.2f}x mais rápido!\n")

        resultado["historico_lotes"][0]["tempo_cluster"] = round(tempo_total, 2)

        with open(CAMINHO_JSON, "w", encoding="utf-8") as f:
            json.dump(dados, f, indent=2)

    print("==========================================")
    print("Processamento do Cluster finalizado com sucesso!")
    print("O arquivo 'resultados.json' está preenchido!")
    print("==========================================")
    
    cliente.close()

if __name__ == "__main__":
    main()