#include "../include/Grafo.hpp"
#include <iostream>
#include <queue> 
#include <algorithm> 

Grafo::Grafo(int n) { 
    num_vertices = n;
    vertices.resize(n+1); 
    for(int i = 1; i <= n; i++){
        vertices[i].id = i;
    }
}

void Grafo::adicionarAresta(int origem, int destino) {
    vertices[origem].adjacentes.push_back(destino); 
    vertices[destino].grau_entrada++; 
}

std::vector<int> Grafo::caminhadaTopologica(){ 
    std::queue<int> fila;
    std::vector <int> ordem;

    for(int i = 1; i <= num_vertices; i++){
        if(vertices[i].grau_entrada == 0){
            fila.push(i); 
            vertices[i].tempo_termino = vertices[i].peso; 
        }
    }

    while(!fila.empty()){
        int atual = fila.front(); 
        fila.pop(); 
        ordem.push_back(atual); 

        for(int vizinhos : vertices[atual].adjacentes){
            int tempo_passando_aqui = vertices[atual].tempo_termino + vertices[vizinhos].peso;

            if(tempo_passando_aqui > vertices[vizinhos].tempo_termino){ 
                vertices[vizinhos].tempo_termino = tempo_passando_aqui;
                vertices[vizinhos].predecessor_maximo = atual;
            }
            vertices[vizinhos].grau_entrada--; 
            
            if(vertices[vizinhos].grau_entrada == 0){ 
                fila.push(vizinhos); 
            }
        }
    }
    return ordem;
}

void Grafo::imprimirCaminhoMaximo(int destino) {
    if (destino < 0 || destino > num_vertices) {
        std::cout << "Destino invalido." << std::endl;
        return;
    }

    std::vector<int> caminho; 
    int atual = destino; 

    while (atual != -1) { 
        caminho.push_back(atual); 
        atual = vertices[atual].predecessor_maximo; 
    }

    std::reverse(caminho.begin(), caminho.end()); 

    std::cout << "Caminho maximo para o destino " << destino << ": ";
    for (int vertice : caminho) {
        std::cout << vertice << " ";
    }
    std::cout << "\nTempo total (custo do caminho): " << vertices[destino].tempo_termino << std::endl; 
    std::cout << "Quantidade de arestas (saltos): " << (caminho.size() - 1) << std::endl; 
}

void Grafo::setPeso(int idVertice, int peso) {
    if (idVertice < 1 || idVertice > num_vertices) {
        std::cout << "ID do vértice invalido." << std::endl;
        return;
    }
    vertices[idVertice].peso = peso;
}

int Grafo::getPeso(int idVertice) {
    if (idVertice < 1 || idVertice > num_vertices) {
        std::cout << "ID do vértice invalido." << std::endl;
        return 0; 
    }
    return vertices[idVertice].peso;
}