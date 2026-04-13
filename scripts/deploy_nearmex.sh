#!/bin/bash
# ==================================================
# deploy_nearmex.sh - Versión UNIVERSAL (Nueva/Existente)
# ==================================================

# 1. DEFINICIÓN DE RUTAS Y ARCHIVOS
PROJECT_NAME="NearMex-OG"
# Intentamos localizar el archivo de configuración en posibles rutas
if [ -d "$HOME/$PROJECT_NAME/scripts" ]; then
    CONFIG_FILE="$HOME/$PROJECT_NAME/scripts/.deploy_config"
else
    CONFIG_FILE="$HOME/.deploy_config"
fi

# --- Funciones de Utilidad ---

cargar_configuracion() {
    if [ -f "$CONFIG_FILE" ]; then
        echo "--- Cargando configuración guardada ---"
        source "$CONFIG_FILE"
    fi
}

guardar_configuracion() {
    # Asegurar que el directorio del config exista
    mkdir -p "$(dirname "$CONFIG_FILE")"
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
    
    if [ -n "$valor_actual" ]; then
        echo "> $prompt_text [OK]"
        return
    fi

    if [ ! -t 0 ]; then
        echo "ERROR CRÍTICO: La variable $var_name no está definida y el script no es interactivo."
        exit 1
    fi

    local nuevo_valor=""
    while [ -z "$nuevo_valor" ]; do
        read -p "$prompt_text" nuevo_valor
    done
    eval "$var_name=\$nuevo_valor"
}

echo "--- Iniciando Despliegue Automatizado de NearMex ---"

# 2. GESTIÓN DEL REPOSITORIO (Instancia Nueva vs Existente)
cargar_configuracion

# Si no estamos dentro de una carpeta git, clonamos
if [ ! -d ".git" ] && [ ! -d "$HOME/$PROJECT_NAME/.git" ]; then
    echo "--- Configurando instancia nueva ---"
    validar_campo "URL del repositorio GitHub: " REPO_URL
    cd "$HOME"
    git clone -b automatización "$REPO_URL" "$PROJECT_NAME" || exit 1
    cd "$PROJECT_NAME"
else
    # Si ya existe, nos aseguramos de estar en la carpeta correcta
    if [ -d "$HOME/$PROJECT_NAME" ]; then
        cd "$HOME/$PROJECT_NAME"
    fi
    echo "--- Repositorio detectado en $(pwd) ---"
fi

# 3. VALIDACIÓN DE DATOS RESTANTES
validar_campo "Email de GitHub: " GIT_EMAIL
validar_campo "Usuario de GitHub: " GIT_NAME
validar_campo "IP Publica de la EC2: " IP_PUBLICA
validar_campo "Nombre del Bucket S3: " BUCKET_S3
guardar_configuracion

# 4. ACTUALIZACIÓN DE CÓDIGO
git config --global user.email "$GIT_EMAIL"
git config --global user.name "$GIT_NAME"
echo "Sincronizando con rama automatización..."
git fetch origin automatización
git reset --hard origin/automatización

# 5. CONFIGURACIÓN DE VARIABLES (.env)
echo "Generando archivos de configuración .env..."
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

[ -d "NearMexBackend" ] && cp .env NearMexBackend/.env && echo "DB_HOST=nearmex-db" >> NearMexBackend/.env
if [ -d "NearMexReact" ]; then
    API_FILE="NearMexReact/src/services/api.js"
    [ -f "$API_FILE" ] && sed -i "s|const API_URL = 'http://.*:5000/api'|const API_URL = 'http://$IP_PUBLICA:5000/api'|" "$API_FILE"
fi

# 6. DOCKER Y PERSISTENCIA DE DATOS
echo "Reiniciando servicios (Sin borrar volúmenes)..."
docker-compose down # Sin -v para mantener la DB
docker-compose up -d --build

echo "Esperando inicialización de MariaDB..."
sleep 15

# Revisar si la DB ya tiene datos para no sobrescribir
TABLAS=$(docker exec nearmex_db_container mariadb -u root -p$DB_PASS_VAL -e "SHOW TABLES IN $DB_NAME_VAL;" --silent 2>/dev/null)

if [ -z "$TABLAS" ]; then
    SQL_PATH="NearMexBackend/database.sql"
    if [ -f "$SQL_PATH" ]; then
        echo "Base de datos vacía. Importando estructura inicial..."
        docker exec -i nearmex_db_container mariadb -u root -p$DB_PASS_VAL $DB_NAME_VAL < "$SQL_PATH"
    fi
else
    echo "Base de datos con datos previos. Se mantiene la información actual."
fi

# 7. FRONTEND Y DESPLIEGUE S3
if [ -d "NearMexReact" ]; then
    echo "Construyendo Frontend..."
    cd NearMexReact
    npm install && npm run build
    echo "Sincronizando con S3..."
    aws s3 sync dist/ s3://$BUCKET_S3 --delete
    cd ..
fi

echo "--- DESPLIEGUE FINALIZADO CON ÉXITO ---"
echo "URL Backend: http://$IP_PUBLICA:5000"