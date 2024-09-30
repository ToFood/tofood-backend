# Versão do Node.js 
FROM node:alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e package-lock.json (se disponível)
COPY package*.json ./


# Instala apenas dependências de produção
#RUN npm ci --only=production
RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"]
