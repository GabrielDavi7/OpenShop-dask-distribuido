@echo off
echo =====================================================
echo Iniciando a instalacao do Projeto Dask+VNS (WINDOWS)
echo =====================================================

echo [1/3] Compilando o Motor Matematico C++...
REM Presume que o GCC (MinGW) esteja instalado e configurado no PATH do Windows
g++ openshop\src\main_worker.cpp openshop\src\Grafo.cpp openshop\src\ParserTA.cpp -o openshop\vns_worker.exe -O3
echo - Compilacao C++ concluida! Binario 'vns_worker.exe' gerado.

echo [2/3] Instalando dependencias do Python (Dask)...
pip install -r cluster\requirements.txt

echo [3/3] Instalando dependencias do Frontend (React/Vite)...
cd apresentacao
call npm install
cd ..

echo =====================================================
echo Instalacao no Windows concluida com sucesso!
echo - Para rodar o cluster: cd cluster e rode 'python rodar_cluster.py'
echo - Para rodar a interface: cd apresentacao e rode 'npm run dev'
echo =====================================================
pause