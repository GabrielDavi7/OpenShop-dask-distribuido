import subprocess
import time
import json
import os
import platform
import glob

DIRETORIO_SCRIPT = os.path.dirname(os.path.abspath(__file__))
DIRETORIO_RAIZ = os.path.dirname(DIRETORIO_SCRIPT)
DIRETORIO_OPENSHOP = os.path.join(DIRETORIO_RAIZ, "openshop")

sistema = platform.system()
NOME_EXECUTAVEL = "vns_worker.exe" if sistema == "Windows" else "vns_worker"
EXECUTAVEL = os.path.join(DIRETORIO_OPENSHOP, NOME_EXECUTAVEL)
PASTA_INSTANCIAS = os.path.join(DIRETORIO_OPENSHOP, "instancias")

INICIO_LOTE = 0
FIM_LOTE = 9999

dados_completos = {
    "projeto": "Open Shop Scheduling",
    "algoritmo": "VNS",
    "resultados": []
}

print("==========================================")
print("Iniciando Fase 1: Gerando Base Single Machine 10000")
print("==========================================\n")

arquivos_encontrados = glob.glob(os.path.join(PASTA_INSTANCIAS, "*"))

if not arquivos_encontrados:
    print(f"[ERRO CRÍTICO] Nenhum arquivo foi encontrado na pasta: {PASTA_INSTANCIAS}")
    exit()

for caminho_instancia in arquivos_encontrados:
    
    nome_arquivo = os.path.basename(caminho_instancia)
    nome_curto = nome_arquivo.replace("Osp.psi", "").replace(".txt", "").replace(".psi", "")
    
    bloco_instancia = {
        "instancia": nome_curto,
        "tamanho_vizinhanca": (FIM_LOTE - INICIO_LOTE) + 1,
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

    print(f"O C++ está processando a {nome_curto} ({nome_arquivo})...")
    
    tempo_inicio = time.time()
    
    comando = [EXECUTAVEL, caminho_instancia, str(INICIO_LOTE), str(FIM_LOTE)]
    
    try:
        processo = subprocess.run(comando, capture_output=True, text=True, check=True, cwd=DIRETORIO_OPENSHOP)
    except Exception as e:
        print(f"[ERRO] Falha ao executar o C++ para o arquivo {nome_arquivo}: {e}\n")
        continue

    tempo_total = time.time() - tempo_inicio
    
    makespan = None
    for linha in processo.stdout.split('\n'):
        if "MAKESPAN:" in linha:
            makespan = int(linha.split(":")[1].strip())
            break
    
    if makespan is not None:
        print(f"-> Concluído! Makespan: {makespan} | Tempo: {tempo_total:.2f} s\n")
        bloco_instancia["maquina_isolada"]["tempo_execucao_segundos"] = round(tempo_total, 2)
        bloco_instancia["maquina_isolada"]["melhor_makespan"] = makespan
        bloco_instancia["historico_lotes"][0]["tempo_isolada"] = round(tempo_total, 2)
        bloco_instancia["historico_lotes"][0]["status"] = "Processado"
    else:
        print(f"[ERRO] Falha ao capturar o MAKESPAN na {nome_curto}. Verifique a saída do C++.\n")

    dados_completos["resultados"].append(bloco_instancia)

caminho_json = os.path.join(DIRETORIO_SCRIPT, "resultados.json") 

with open(caminho_json, "w", encoding="utf-8") as f:
    json.dump(dados_completos, f, indent=2)

print("==========================================")
print("Processamento das instâncias finalizado!")
print(f"O arquivo '{caminho_json}' foi gerado!")
print("==========================================")