#!/bin/bash
# deploy_nearmex.sh - Despliegue de NearMex (Versión Final con gestión de .env)

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
# A. Crear archivo .env en la RAÍZ para Docker Compose
# Esto elimina los warnings de "variable is not set"
echo "Configurando .env principal para Docker Compose..."
cat <<EOF > .env
DB_NAME=nearmex_db
DB_USER=nearmex_user
DB_PASS=nearmex
EOF

# B. Backend (Copiamos el .env recién creado a la carpeta del backend)
if [ -d "NearMexBackend" ]; then
    echo "Sincronizando configuración con NearMexBackend..."
    cp .env NearMexBackend/.env
    # Aseguramos que el Host apunte al contenedor de la DB
    echo "DB_HOST=nearmex-db" >> NearMexBackend/.env
fi

# C. Frontend (Configuración de API_URL)
if [ -d "NearMexReact" ]; then
    echo "Configurando API_URL en NearMexReact..."
    cd NearMexReact
    API_FILE="src/services/api.js"
    if [ -f "$API_FILE" ]; then
        sed -i "s|const API_URL = 'http://.*:5000/api'|const API_URL = 'http://$IP_PUBLICA:5000/api'|" $API_FILE
    fi
    cd ..
fi

# 4. Despliegue con Docker e Importación de Datos
echo "Levantando contenedores con docker-compose..."
docker-compose up -d --build

echo "Esperando 15 segundos a que la base de datos inicie correctamente..."
sleep 15

# IMPORTACIÓN AUTOMÁTICA (Ruta corregida)
# Ahora buscamos el archivo específicamente dentro de la carpeta del Backend
SQL_PATH="NearMexBackend/database.sql"

if [ -f "$SQL_PATH" ]; then
    echo "Importando datos desde $SQL_PATH..."
    docker exec -i nearmex_db_container mariadb -u nearmex_user -pnearmex nearmex_db < "$SQL_PATH"
    echo "¡Estructura y datos de NearMex importados con éxito!"
else
    echo "Error: No se encontró el archivo en $SQL_PATH"
fi

# 5. Build de React y Sincronización con S3
if [ -d "NearMexReact" ]; then
    echo "Iniciando build de producción para React..."
    cd NearMexReact
    npm install && npm audit fix --force
    npm run build
    echo "Subiendo archivos al Bucket: $BUCKET_S3"
    aws s3 sync dist/ s3://$BUCKET_S3 --delete
    cd ..
fi

echo "¡Es peligroso ir solo! Toma esto (Despliegue exitoso)"