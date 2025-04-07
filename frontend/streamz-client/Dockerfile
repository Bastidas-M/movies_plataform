FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Instalar un servidor ligero para servir la aplicación
RUN npm install -g serve

# Exponer el puerto (Railway proporciona PORT como variable de entorno)
ENV PORT=3000
EXPOSE ${PORT}

# Comando para iniciar el servidor (más explícito)
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]