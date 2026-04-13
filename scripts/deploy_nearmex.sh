#!/bin/bash
# deploy_nearmex.sh - Versión Final (Uso de .env existente y Auto-Importación)

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

# 2. Gestión de Directorios
REPO_DIR=$(basename "$REPO_URL" .git)
if [ ! -d "$REPO_DIR" ]; then
    git clone -b automatización "$REPO_URL" || exit 1
fi
cd "$REPO_DIR" || exit
git pull origin automatización

# 3. Configuración de Archivos .env (Usando el del repo)
echo "Sincronizando variables de entorno desde NearMexBackend/.env..."
BACKEND_ENV="NearMexBackend/.env"

if [ -f "$BACKEND_ENV" ]; then
    # Ajustamos el Host para que el Backend encuentre el contenedor de la DB
    sed -i "s/^DB_HOST=.*/DB_HOST=nearmex-db/" "$BACKEND_ENV"
    
    # Copiamos el .env a la raíz para que docker-compose pueda leerlo
    cp "$BACKEND_ENV" .env
    echo "Archivo .env preparado."
else
    echo "ERROR: No se encontró el archivo .env en NearMexBackend."
    exit 1
fi

# Configuración de IP en Frontend
if [ -d "NearMexReact" ]; then
    API_FILE="NearMexReact/src/services/api.js"
    if [ -f "$API_FILE" ]; then
        sed -i "s|const API_URL = 'http://.*:5000/api'|const API_URL = 'http://$IP_PUBLICA:5000/api'|" $API_FILE
    fi
fi

# 4. Despliegue con Docker e Importación de Datos
echo "Levantando contenedores..."
docker-compose up -d --build

echo "Esperando 15 segundos a que MariaDB esté lista..."
sleep 15

# IMPORTACIÓN AUTOMÁTICA (Ruta corregida a la carpeta Backend)
SQL_PATH="NearMexBackend/database.sql"
if [ -f "$SQL_PATH" ]; then
    echo "Importando datos desde $SQL_PATH..."
    docker exec -i nearmex_db_container mariadb -u nearmex_user -pnearmex nearmex_db < "$SQL_PATH"
    echo "Base de datos poblada con éxito."
else
    echo "Aviso: No se encontró $SQL_PATH"
fi

# 5. Build de React y S3
if [ -d "NearMexReact" ]; then
    echo "Generando build de producción..."
    cd NearMexReact
    npm install && npm run build
    echo "Subiendo a S3..."
    aws s3 sync dist/ s3://$BUCKET_S3 --delete
    cd ..
fi

echo "Despliegue terminado. ¡NearMex está en línea!"