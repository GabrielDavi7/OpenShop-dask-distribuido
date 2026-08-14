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

O processo de coleta de dados é dividido em duas fases:

- **Fase 1 (Modo Sequencial / Baseline):** O script orquestrador roda o motor C++ de forma isolada (em uma única máquina) para instâncias específicas de Taillard (ex: `ta28`, `ta60`). O tempo é cronometrado com precisão e salvo como o cenário base.
- **Fase 2 (Modo Cluster Distribuído):** Múltiplas máquinas são conectadas em uma rede local via Dask. O orquestrador fatia o espaço de busca da vizinhança do VNS e distribui as tarefas pela rede. O tempo total do processamento paralelo é registrado e comparado com a Fase 1.
- **Fase 3 (Geração de Resultados):** O Python consolida todos os dados extraídos, calcula as porcentagens de melhoria de desempenho e injeta essas informações em um arquivo `resultados.json` que alimenta automaticamente o frontend.

---

## 🚀 Como Executar o Projeto

### 1. Levantando o Dashboard (Interface Visual)

Navegue até a pasta do frontend e inicie o ambiente de desenvolvimento Vite. Os gráficos serão renderizados a partir do arquivo JSON atual.

```bash
cd apresentacao
npm install
npm run dev
```
