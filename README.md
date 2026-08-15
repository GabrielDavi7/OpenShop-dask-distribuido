# 🚀 Otimização Distribuída de Open Shop Scheduling

Este repositório contém a implementação de um sistema de processamento distribuído para resolver o problema de **Open Shop Scheduling** utilizando a metaheurística **VNS (Variable Neighborhood Search)**.

A arquitetura combina **C++** com **Python (Dask)** e uma interface de apresentação em **React**.

---

## 🏗️ Arquitetura do Sistema

O projeto foi construído separando responsabilidades em três camadas principais:

1. **Motor Matemático (C++):** Responsável exclusivamente por executar a matemática complexa e a heurística VNS. É compilado nativamente para garantir o menor tempo de execução possível.
2. **Orquestrador de Rede (Python + Dask):** O cluster. Ele automatiza as execuções do C++, divide a carga de processamento de vizinhanças entre os nós da rede (Master e Workers) e consolida os cálculos de tempo.
3. **Painel de Apresentação (React + Vite):** Um dashboard lê os resultados finais compilados pelo Python e gera gráficos comparativos de desempenho (Tempo Isolado vs. Tempo em Cluster).

---

## ⚙️ Fluxo de Trabalho (Pipeline)

O processo de experimentação e coleta de métricas é dividido em três fases:

- **Fase 1 (Modo Sequencial / Baseline):** O script orquestrador roda o motor C++ de forma isolada em uma única máquina, varrendo as instâncias de Taillard (ex: `ta01` a `ta60`). O tempo de execução de toda a vizinhança é cronometrado com precisão para estabelecer nosso cenário base.
- **Fase 2 (Modo Cluster Distribuído):** Múltiplas máquinas são conectadas em uma rede local via Dask, somando o total de _threads_ disponíveis. O orquestrador fatia o espaço de busca da vizinhança do VNS em lotes menores e os distribui dinamicamente pela rede. O tempo total do processamento paralelo é registrado.
- **Fase 3 (Geração de Resultados):** O Python consolida todos os dados extraídos, filtra os melhores _makespans_, calcula os ganhos de aceleração (_Speedup_) e injeta essas informações no arquivo `resultados.json` que alimenta o frontend automaticamente.

---

## 🚀 Como Executar o Projeto

### 1. Levantando o Dashboard (Interface Visual)

Navegue até a pasta do frontend e inicie o ambiente de desenvolvimento Vite. Os gráficos serão renderizados a partir do arquivo JSON atual.

```bash
cd apresentacao
npm install
npm run dev
```
