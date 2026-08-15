#ifndef ParserTA_hpp
#define ParserTA_hpp

#include <string>
#include <vector>

struct Instancia{
    int num_trabalhos;
    int num_maquinas;
    std::vector<std::vector<int>> custos; 
};

class ParserTA{
    public:
        static Instancia lerArquivo(const std::string& caminhoArquivo);
};

#endif