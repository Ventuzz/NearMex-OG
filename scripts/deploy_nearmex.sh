#!/bin/bash
# Despliegue de NearMex

validar_campo() {
    local prompt_text=$1
    local var_name=$2
    local valor=""
    
    while [ -z "$valor" ]; do
        read -p "$prompt_text" valor
        if [ -z "$valor" ]; then
            echo "Error: Este campo es obligatorio."
        fi
    done
    eval "$var_name=\$valor"
}

echo "Iniciando despliegue de NearMex"

validar_campo "URL del repositorio GitHub: " REPO_URL
validar_campo "Email de GitHub: " GIT_EMAIL
validar_campo "Usuario de GitHub: " GIT_NAME
validar_campo "IP Publica de la EC2: " IP_PUBLICA
validar_campo "Nombre del Bucket S3: " BUCKET_S3

# 1. Identidad Git
git config --global user.email "$GIT_EMAIL"
git config --global user.name "$GIT_NAME"

# 2. Gestion de Directorios
REPO_DIR=$(basename "$REPO_URL" .git)
if [ ! -d "$REPO_DIR" ]; then
    git clone -b automatización "$REPO_URL" || exit 1
fi
cd "$REPO_DIR" || exit
git pull origin automatización

# 3. Configuracion de Archivos
# Backend
if [ -d "NearMexBackend" ]; then
    cd NearMexBackend
    sed -i "s/DB_USER=.*/DB_USER=nearmex_user/" .env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=nearmex/" .env
    sed -i "s/DB_NAME=.*/DB_NAME=nearmex_db/" .env
    cd ..
fi

# Frontend
if [ -d "NearMexReact" ]; then
    cd NearMexReact
    API_FILE="src/services/api.js"
    sed -i "s|const API_URL = 'http://.*:5000/api'|const API_URL = 'http://$IP_PUBLICA:5000/api'|" $API_FILE
    cd ..
fi

# 4. Despliegue con Docker
docker-compose up -d --build

# 5. Build y S3
cd NearMexReact
npm install && npm audit fix --force
npm run build
aws s3 sync dist/ s3://$BUCKET_S3 --delete

echo "¡Es peligroso ir solo! Toma esto (Despliegue exitoso) "