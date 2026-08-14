# arquivo de instalacao do projeto Dask+VNS ele roda o requirements.txt do cluster e o npm install do frontend VERSÂO LINUX

echo "=========================================="
echo "Iniciando a instalação do Projeto Dask+VNS"
echo "=========================================="

echo "[1/2] Instalando dependências do Python (Dask)..."
# Presume que o usuário já ativou um ambiente virtual (venv), se necessário
pip install -r cluster/requirements.txt

echo "[2/2] Instalando dependências do Frontend (React/Vite)..."
cd apresentacao
npm install
cd ..

echo "=========================================="
echo "Instalação concluída com sucesso!"
echo "-> Para rodar o cluster: cd cluster && python master_dask.py"
echo "-> Para rodar a interface: cd apresentacao && npm run dev"
echo "=========================================="