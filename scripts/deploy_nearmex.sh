#!/bin/bash
# ==================================================
# deploy_nearmex.sh - Versión Final Corregida
# ==================================================

# Buscamos el archivo en la misma carpeta donde reside este script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/.deploy_config"

cargar_configuracion() {
    if [ -f "$CONFIG_FILE" ]; then
        echo "--- Cargando configuración desde $CONFIG_FILE ---"
        source "$CONFIG_FILE"
    else
        echo "--- No se encontró archivo de configuración previo ---"
    fi
}

guardar_configuracion() {
    cat <<EOF > "$CONFIG_FILE"
REPO_URL="$REPO_URL"
GIT_EMAIL="$GIT_EMAIL"
GIT_NAME="$GIT_NAME"
IP_PUBLICA="$IP_PUBLICA"
BUCKET_S3="$BUCKET_S3"
EOF
    chmod 600 "$CONFIG_FILE"
}

validar_campo() {
    local prompt_text=$1
    local var_name=$2
    local valor_actual="${!var_name}"
    
    # Si la variable ya tiene valor, saltar
    if [ -n "$valor_actual" ]; then
        echo "> $prompt_text [OK]"
        return
    fi

    # Si NO es una terminal interactiva (como en GitHub Actions) y está vacío, ERROR
    if [ ! -t 0 ]; then
        echo "ERROR CRÍTICO: La variable $var_name no está definida en el entorno ni en el config."
        exit 1
    fi

    local nuevo_valor=""
    while [ -z "$nuevo_valor" ]; do
        read -p "$prompt_text" nuevo_valor
        if [ -z "$nuevo_valor" ]; then
            echo "Error: Este campo es obligatorio."
        fi
    done
    eval "$var_name=\$nuevo_valor"
}

echo "--- Iniciando Despliegue Automatizado de NearMex ---"

# 0. Intentar cargar configuración
cargar_configuracion

validar_campo "URL del repositorio GitHub: " REPO_URL
validar_campo "Email de GitHub: " GIT_EMAIL
validar_campo "Usuario de GitHub: " GIT_NAME
validar_campo "IP Publica de la EC2: " IP_PUBLICA
validar_campo "Nombre del Bucket S3: " BUCKET_S3

# 1. Moverse a la raíz del proyecto (un nivel arriba de /scripts)
cd "$SCRIPT_DIR/.." || exit

# --- 2. Configuración de Identidad Git ---
git config --global user.email "$GIT_EMAIL"
git config --global user.name "$GIT_NAME"

# --- 3. Gestión del Repositorio ---
# (Asumiendo que ya estás dentro del repo clonado por el YAML)
echo "Actualizando código fuente..."
git pull origin automatización

# --- 4. Configuración de Variables (.env) ---
echo "Generando archivo .env..."
DB_NAME_VAL="nearmex_db"
DB_USER_VAL="nearmex_user"
DB_PASS_VAL="nearmex"
JWT_SECRET_VAL="NearMex_Secret_Key_2026"

cat <<EOF > .env
DB_NAME=$DB_NAME_VAL
DB_USER=$DB_USER_VAL
DB_PASS=$DB_PASS_VAL
JWT_SECRET=$JWT_SECRET_VAL
EOF

if [ -d "NearMexBackend" ]; then
    cp .env NearMexBackend/.env
    echo "DB_HOST=nearmex-db" >> NearMexBackend/.env
fi

if [ -d "NearMexReact" ]; then
    API_FILE="NearMexReact/src/services/api.js"
    if [ -f "$API_FILE" ]; then
        sed -i "s|const API_URL = 'http://.*:5000/api'|const API_URL = 'http://$IP_PUBLICA:5000/api'|" $API_FILE
    fi
fi

# --- 5. Docker y Persistencia ---
echo "Reiniciando servicios (Preservando volúmenes)..."
docker-compose down
docker-compose up -d --build

echo "Esperando a MariaDB (15s)..."
sleep 15

# Verificar si hay tablas para no borrar datos
TABLAS=$(docker exec nearmex_db_container mariadb -u root -p$DB_PASS_VAL -e "SHOW TABLES IN $DB_NAME_VAL;" --silent)

if [ -z "$TABLAS" ]; then
    SQL_PATH="NearMexBackend/database.sql"
    if [ -f "$SQL_PATH" ]; then
        echo "Importando base de datos inicial..."
        docker exec -i nearmex_db_container mariadb -u root -p$DB_PASS_VAL $DB_NAME_VAL < "$SQL_PATH"
    fi
else
    echo "Base de datos con información previa. No se importa el SQL."
fi

# --- 6. Frontend y S3 ---
if [ -d "NearMexReact" ]; then
    cd NearMexReact
    npm install && npm run build
    aws s3 sync dist/ s3://$BUCKET_S3 --delete
fi

echo "--- DESPLIEGUE FINALIZADO ---"