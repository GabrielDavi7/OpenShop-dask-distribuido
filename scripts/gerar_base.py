import subprocess
import time
import json
import os

EXECUTAVEL = r".\vns_worker.exe"
PASTA_INSTANCIAS = r"openshop\instancias"

todas_instancias_do_projeto = [f"ta{str(i).zfill(2)}" for i in range(1, 61)]

instancias_para_rodar = todas_instancias_do_projeto 

INICIO_LOTE = 0
FIM_LOTE = 1500

dados_completos = {
    "projeto": "Open Shop Scheduling",
    "algoritmo": "VNS",
    "resultados": []
}

print("Iniciando o processamento das  instâncias...\n")

for nome_curto in todas_instancias_do_projeto:
    
    bloco_instancia = {
        "instancia": nome_curto,
        "tamanho_vizinhanca": FIM_LOTE - INICIO_LOTE,
        "maquina_isolada": {
            "tempo_execucao_segundos": None,
            "melhor_makespan": None
        },
        "cluster_dask": {
            "tempo_execucao_segundos": None,
            "melhor_makespan": None,
            "nos_ativos": None
        },
        "ganho_desempenho_vezes": None,
        "historico_lotes": [
            {
                "id": 1,
                "lote": f"Lote {INICIO_LOTE}-{FIM_LOTE}",
                "tempo_isolada": None,
                "tempo_cluster": None,
                "status": "Pendente"
            }
        ]
    }

    if nome_curto in instancias_para_rodar:
        nome_arquivo = f"{nome_curto}Osp.psi"
        caminho_instancia = os.path.join(PASTA_INSTANCIAS, nome_arquivo)
        
        if os.path.exists(caminho_instancia):
            print(f"⏳ O C++ está processando a {nome_curto}...")
            
            tempo_inicio = time.time()
            comando = [EXECUTAVEL, caminho_instancia, str(INICIO_LOTE), str(FIM_LOTE)]
            processo = subprocess.run(comando, capture_output=True, text=True)
            tempo_total = time.time() - tempo_inicio
            
            makespan = None
            for linha in processo.stdout.split('\n'):
                if "MAKESPAN:" in linha:
                    makespan = int(linha.split(":")[1].strip())
                    break
            
            if makespan is not None:
                print(f" Concluído! Makespan: {makespan} | Tempo: {tempo_total:.2f} s\n")
                bloco_instancia["maquina_isolada"]["tempo_execucao_segundos"] = round(tempo_total, 2)
                bloco_instancia["maquina_isolada"]["melhor_makespan"] = makespan
                bloco_instancia["historico_lotes"][0]["tempo_isolada"] = round(tempo_total, 2)
                bloco_instancia["historico_lotes"][0]["status"] = "Processado"
        else:
            print(f" Arquivo não encontrado: {caminho_instancia} (Ficará com valores null)\n")

    dados_completos["resultados"].append(bloco_instancia)

caminho_json = "resultados.json"
with open(caminho_json, "w", encoding="utf-8") as f:
    json.dump(dados_completos, f, indent=2)

print(f" Processamento das 60 instâncias finalizado! O arquivo '{caminho_json}' foi gerado.")