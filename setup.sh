#!/bin/bash

echo "====================================================="
echo "Iniciando a instalação do Projeto Dask+VNS (UBUNTU)"
echo "====================================================="

echo "[1/4] Instalando dependências base do Linux (C++ e Python)..."
sudo apt update
sudo apt install -y build-essential python3-pip python3-venv

echo "[2/4] Compilando o Motor Matemático C++ (Versão Nativa)..."
g++ openshop/src/main_worker.cpp openshop/src/Grafo.cpp openshop/src/ParserTA.cpp -o vns_worker -O3
echo "-> Compilação C++ concluída! Binário 'vns_worker' gerado."

echo "[3/4] Instalando dependências do Python (Dask)..."
python3 -m venv venv
source venv/bin/activate
pip install -r cluster/requirements.txt

echo "[4/4] Instalando dependências do Frontend (React/Vite)..."
if command -v npm &> /dev/null; then
    cd apresentacao
    npm install
    cd ..
else
    echo "-> AVISO: 'npm' não encontrado neste Ubuntu Server."
    echo "-> DICA: O Dashboard em React deve preferencialmente ser executado no seu Windows."
fi

echo "====================================================="
echo "Instalação no Linux concluída com sucesso!"
echo "-> Para rodar o cluster: source venv/bin/activate && cd cluster && python rodar_cluster.py"
echo "====================================================="