import json
import time
import os
import platform
from dask.distributed import Client, as_completed

DIRETORIO_SCRIPT = os.path.dirname(os.path.abspath(__file__))
DIRETORIO_RAIZ = os.path.dirname(DIRETORIO_SCRIPT)
DIRETORIO_OPENSHOP = os.path.join(DIRETORIO_RAIZ, "openshop")
CAMINHO_JSON = os.path.join(DIRETORIO_SCRIPT, "resultados.json")

# 15 vai ser o numero de vizinhos que cada thread vai processar, ou seja, cada thread vai executar 15 vizinhos do VNS distribuido entre os computadores
# como temos 3000 vai ser 3000/15 = 200 lotes
TAMANHO_LOTE = 15  

def executar_lote_vns(caminho_instancia, inicio, fim, diretorio_openshop): 
    """
    Função executada de forma isolada pelas threads nos workers (notebooks da equipe).
    As importações devem ficar dentro da função para o Dask conseguir enviá-las pela rede.
    """
    import subprocess
    import platform
    import os
    
    sistema = platform.system()
    nome_executavel = "vns_worker.exe" if sistema == "Windows" else "vns_worker"
    executavel = os.path.join(diretorio_openshop, nome_executavel)
    
    comando = [executavel, caminho_instancia, str(inicio), str(fim)]
    
    try:
        processo = subprocess.run(comando, capture_output=True, text=True, check=True, cwd=diretorio_openshop)
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
    
    cliente = Client() 
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
        caminho_instancia = os.path.join(DIRETORIO_OPENSHOP, "instancias", nome_arquivo)

        print(f"Fatiando {instancia} para o cluster ({tamanho_total} vizinhos)...")
        
        tempo_inicio = time.time()
        tarefas = []


        for inicio in range(0, tamanho_total, TAMANHO_LOTE):
            fim = min(inicio + TAMANHO_LOTE - 1, tamanho_total - 1)
            
            tarefa = cliente.submit(executar_lote_vns, caminho_instancia, inicio, fim, DIRETORIO_OPENSHOP)
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
    print("O arquivo 'resultados.json' está preenchido e pronto para o React!")
    print("==========================================")
    
    cliente.close()

if __name__ == "__main__":
    main()