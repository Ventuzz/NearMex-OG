#!/bin/bash
# ==================================================
# deploy_nearmex.sh - Versión Pro (Persistente)
# ==================================================

# Archivo donde se guardará la configuración para no repetir preguntas
CONFIG_FILE=".deploy_config"

# --- Funciones de Configuración ---

cargar_configuracion() {
    if [ -f "$CONFIG_FILE" ]; then
        echo "--- Cargando configuración guardada ---"
        source "$CONFIG_FILE"
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
    local nuevo_valor=""
    
    # Si la variable ya tiene valor (cargado de config o env), saltar pregunta
    if [ -n "$valor_actual" ]; then
        echo "> $prompt_text [OK: $valor_actual]"
        return
    fi

    while [ -z "$nuevo_valor" ]; do
        read -p "$prompt_text" nuevo_valor
        if [ -z "$nuevo_valor" ]; then
            echo "Error: Este campo es obligatorio."
        fi
    done
    eval "$var_name=\$nuevo_valor"
}

echo "--- Iniciando Despliegue Automatizado de NearMex ---"

# 0. Preparación de variables
cargar_configuracion

validar_campo "URL del repositorio GitHub: " REPO_URL
validar_campo "Email de GitHub: " GIT_EMAIL
validar_campo "Usuario de GitHub: " GIT_NAME
validar_campo "IP Publica de la EC2: " IP_PUBLICA
validar_campo "Nombre del Bucket S3: " BUCKET_S3

guardar_configuracion

# --- 1. Configuración de Identidad Git ---
git config --global user.email "$GIT_EMAIL"
git config --global user.name "$GIT_NAME"

# --- 2. Gestión del Repositorio ---
REPO_DIR=$(basename "$REPO_URL" .git)
if [ ! -d "$REPO_DIR" ]; then
    echo "Clonando repositorio..."
    git clone -b automatización "$REPO_URL" || exit 1
fi
cd "$REPO_DIR" || exit
echo "Actualizando código fuente..."
git pull origin automatización

# --- 3. Configuración de Variables de Entorno (.env) ---
echo "Sincronizando archivos .env..."

DB_NAME_VAL="nearmex_db"
DB_USER_VAL="nearmex_user"
DB_PASS_VAL="nearmex"
JWT_SECRET_VAL="NearMex_Secret_Key_2026"

# Configuración SMTP
SMTP_HOST_VAL="smtp.gmail.com"
SMTP_PORT_VAL=465
SMTP_USER_VAL="nearmex.gdl@gmail.com"
SMTP_PASS_VAL="dvuqwplxtcfiwlwn"
EMAIL_FROM_VAL="NearMex Avisos <nearmex.gdl@gmail.com>"

cat <<EOF > .env
DB_NAME=$DB_NAME_VAL
DB_USER=$DB_USER_VAL
DB_PASS=$DB_PASS_VAL
JWT_SECRET=$JWT_SECRET_VAL
SMTP_HOST=$SMTP_HOST_VAL
SMTP_PORT=$SMTP_PORT_VAL
SMTP_USER=$SMTP_USER_VAL
SMTP_PASS=$SMTP_PASS_VAL
EMAIL_FROM=$EMAIL_FROM_VAL
EOF

if [ -d "NearMexBackend" ]; then
    cp .env NearMexBackend/.env
    echo "DB_HOST=nearmex-db" >> NearMexBackend/.env
fi

if [ -d "NearMexReact" ]; then
    API_FILE="NearMexReact/src/services/api.js"
    if [ -f "$API_FILE" ]; then
        sed -i "s|const API_URL = 'http://.*:5000/api'|const API_URL = 'http://$IP_PUBLICA:5000/api'|" $API_FILE
        echo "Endpoint de API actualizado: http://$IP_PUBLICA:5000/api"
    fi
fi

# --- 4. Despliegue de Infraestructura (Docker) ---
echo "Reiniciando contenedores (Preservando volúmenes de datos)..."
# IMPORTANTE: Sin -v para no borrar la base de datos
docker-compose down 

echo "Construyendo y levantando servicios..."
docker-compose up -d --build

echo "Esperando inicialización de MariaDB (15s)..."
sleep 15

# --- 5. Gestión Inteligente de Base de Datos ---
# Verificamos si la base de datos ya tiene tablas antes de importar el SQL
TABLAS_EXISTENTES=$(docker exec nearmex_db_container mariadb -u root -p$DB_PASS_VAL -e "SHOW TABLES IN $DB_NAME_VAL;" --silent)

if [ -z "$TABLAS_EXISTENTES" ]; then
    SQL_PATH="NearMexBackend/database.sql"
    if [ -f "$SQL_PATH" ]; then
        echo "Base de datos nueva detectada. Importando $SQL_PATH..."
        docker exec -i nearmex_db_container mariadb -u root -p$DB_PASS_VAL $DB_NAME_VAL < "$SQL_PATH"
        echo "Importación completada."
    else
        echo "AVISO: No se encontró archivo SQL para inicializar la base de datos."
    fi
else
    echo "INFO: La base de datos ya contiene datos. Se omite la importación para evitar sobrescritura."
fi

# --- 6. Build de Frontend y Despliegue a S3 ---
if [ -d "NearMexReact" ]; then
    echo "Iniciando build de producción para React..."
    cd NearMexReact
    npm install && npm run build
    echo "Sincronizando con S3: $BUCKET_S3"
    aws s3 sync dist/ s3://$BUCKET_S3 --delete
    cd ..
fi

echo "--- DESPLIEGUE FINALIZADO CON ÉXITO ---"
echo "Backend: http://$IP_PUBLICA:5000"
echo "Frontend: Desplegado en bucket $BUCKET_S3"