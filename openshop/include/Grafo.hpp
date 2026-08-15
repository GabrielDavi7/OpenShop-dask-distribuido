#ifndef GRAFO_HPP
#define GRAFO_HPP

#include <vector>

struct Vertice{
    int id; 
    int peso; 
    int grau_entrada; 
    int tempo_termino;   
    int predecessor_maximo;  
    std::vector<int> adjacentes; 

    Vertice(){
        id = 0;
        peso = 0;
        grau_entrada = 0;
        tempo_termino = 0;
        predecessor_maximo = -1; 
    }
};

class Grafo{
    public:
        int num_vertices;
        std::vector<Vertice> vertices;
        
        Grafo(int n);
        void adicionarAresta(int origem, int destino);
        std::vector<int> caminhadaTopologica();
        void imprimirCaminhoMaximo(int destino);
        void setPeso(int idVertice, int peso);
        int getPeso(int idVertice);
};

#endif