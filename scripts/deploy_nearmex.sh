#!/bin/bash
# deploy_nearmex.sh - Despliegue de NearMex desde la carpeta scripts/

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

# 3. Configuracion de Archivos (Rutas relativas desde la raíz del repo)
# Backend
if [ -d "NearMexBackend" ]; then
    echo "Configurando .env en NearMexBackend..."
    cd NearMexBackend
    [ ! -f .env ] && touch .env
    
    sed -i "s/^DB_USER=.*/DB_USER=nearmex_user/" .env || echo "DB_USER=nearmex_user" >> .env
    sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=nearmex/" .env || echo "DB_PASSWORD=nearmex" >> .env
    sed -i "s/^DB_NAME=.*/DB_NAME=nearmex_db/" .env || echo "DB_NAME=nearmex_db" >> .env
    sed -i "s/^DB_HOST=.*/DB_HOST=nearmex-db/" .env || echo "DB_HOST=nearmex-db" >> .env
    cd ..
fi

# Frontend
if [ -d "NearMexReact" ]; then
    echo "Configurando API_URL en NearMexReact..."
    cd NearMexReact
    API_FILE="src/services/api.js"
    # Ajusta la IP para que el Frontend sepa a qué servidor hablar
    if [ -f "$API_FILE" ]; then
        sed -i "s|const API_URL = 'http://.*:5000/api'|const API_URL = 'http://$IP_PUBLICA:5000/api'|" $API_FILE
    fi
    cd ..
fi

# 4. Despliegue con Docker (Ruta específica según tu imagen)
echo "Levantando contenedores con Docker Compose..."
# Apuntamos a la ubicación exacta del archivo YAML dentro de workflow/aws/
docker compose -f workflow/aws/docker-compose.yaml up -d --build

# 5. Build de React y Sincronización con S3
if [ -d "NearMexReact" ]; then
    echo "Iniciando build de producción para React..."
    cd NearMexReact
    npm install && npm audit fix --force
    npm run build
    echo "Subiendo archivos a S3: $BUCKET_S3"
    aws s3 sync dist/ s3://$BUCKET_S3 --delete
    cd ..
fi

echo "¡Es peligroso ir solo! Toma esto (Despliegue exitoso)"