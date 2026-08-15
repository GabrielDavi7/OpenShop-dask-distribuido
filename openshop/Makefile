# Compilador e flags de otimização máxima
CXX = g++
CXXFLAGS = -O3 -Wall -std=c++17 -I./include

# Estrutura de Diretórios
SRC_DIR = src
INC_DIR = include
OBJ_DIR = obj

# Mapeamento automático dos arquivos fonte
SOURCES = $(wildcard $(SRC_DIR)/*.cpp)
OBJECTS = $(patsubst $(SRC_DIR)/%.cpp, $(OBJ_DIR)/%.o, $(SOURCES))

# Nome do executável final
TARGET = vns_worker

# Regra principal (o que roda quando você digita apenas 'make')
all: dir $(TARGET)

# Cria a pasta de objetos temporários se ela não existir
dir:
	@mkdir -p $(OBJ_DIR)

# Regra de linkagem (junta os arquivos .o para criar o executável final)
$(TARGET): $(OBJECTS)
	$(CXX) $(CXXFLAGS) -o $@ $^
	@echo "=================================================="
	@echo "  Build concluído com sucesso! "
	@echo "  Executável gerado: $(TARGET)"
	@echo "=================================================="

# Regra de compilação (transforma cada .cpp em um arquivo objeto .o)
$(OBJ_DIR)/%.o: $(SRC_DIR)/%.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

# Regra de limpeza (make clean)
clean:
	rm -rf $(OBJ_DIR) $(TARGET) $(TARGET).exe
	@echo "Pasta de objetos e executáveis removidos."