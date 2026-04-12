#!/bin/bash
# setup_env.sh - Configuracion de entorno NearMex 2026

echo "Actualizando sistema e instalando dependencias base..."
sudo dnf update -y

# 1. Instalacion de Docker y sus plugins (Buildx y Compose V2)
echo "Instalando Docker, Compose y Buildx..."
sudo dnf install -y docker docker-compose-plugin docker-buildx-plugin libxcrypt-compat

# 2. Instalacion de herramientas de desarrollo (Git, Node, Python)
echo "Instalando Git, Node.js y Python..."
sudo dnf install -y git nodejs python3 python3-pip

# 3. Instalacion del cliente MariaDB (Para que funcione tu script de respaldo)
echo "Instalando cliente MariaDB..."
sudo dnf install -y mariadb105

# 4. Configuracion de servicios y permisos
echo "Configurando servicios..."
sudo systemctl start docker
sudo systemctl enable docker

# CORRECCIÓN: usermod corregido para aplicar permisos al usuario ec2-user
sudo usermod -aG docker ec2-user

# 5. Instalacion de Librerias de Python (Boto3 para tus respaldos)
echo "Instalando librerias de Python y PM2..."
# Usamos pip directamente para el usuario o con --break-system-packages si dnf lo requiere
pip3 install boto3 GitPython

# PM2 es útil si vas a correr el backend fuera de Docker, si todo va en Docker, es opcional.
sudo npm install -g pm2

# 6. Verificación de Docker Compose
echo "Versión de Docker instalada:"
docker --version
docker compose version

echo "Entorno listo. IMPORTANTE: Cierra esta terminal y vuelve a entrar para que los permisos de grupo (docker) surtan efecto."