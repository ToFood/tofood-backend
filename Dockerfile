# Versão do Node.js
FROM node:alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e package-lock.json (se disponível)
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --only=production --ignore-scripts

# Copia o restante do código da aplicação
COPY . .

# Expõe a porta usada pela aplicação (ajuste conforme necessário)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"]
