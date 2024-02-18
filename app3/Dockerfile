# Usando a imagem base do Node
FROM node:16

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos do projeto para o container
COPY package*.json ./
COPY index.js .

# Instala as dependências do projeto
RUN npm install

# Comando para manter o container rodando
CMD ["node", "index.js"]
