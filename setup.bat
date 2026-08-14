REM arquivo de instalacao do projeto Dask+VNS ele roda o requirements.txt do cluster e o npm install do frontend VERSÂO WINDOWS

@echo off
echo ==========================================
echo Iniciando a instalacao do Projeto Dask+VNS
echo ==========================================

echo [1/2] Instalando dependencias do Python (Dask)...
pip install -r cluster\requirements.txt

echo [2/2] Instalando dependencias do Frontend (React/Vite)...
cd apresentacao
call npm install
cd ..

echo ==========================================
echo Instalacao concluida com sucesso!
echo - Para rodar o cluster: entre na pasta cluster e rode 'python master_dask.py'
echo - Para rodar a interface: entre na pasta apresentacao e rode 'npm run dev'
echo ==========================================
pause