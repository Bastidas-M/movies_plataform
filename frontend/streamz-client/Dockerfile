FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Instalar un servidor ligero para servir la aplicación
RUN npm install -g serve

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["serve", "-s", "build", "-l", "3000"]