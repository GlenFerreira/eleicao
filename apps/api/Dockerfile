# Dockerfile para deploy no Render
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Build da aplicação
WORKDIR /app/apps/api
RUN npm run build

# Expor porta
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "start"]
