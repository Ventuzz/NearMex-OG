#!/bin/bash
# setup_env.sh - Configuración de entorno NearMex 2026 (Versión Optimizada)

echo "Actualizando sistema e instalando dependencias base..."
sudo dnf update -y

# 1. Instalación de Docker y Herramientas Base
# Instalamos MariaDB 10.5, Git y Python 3.9+ que son el estándar en AL2023
echo "Instalando Docker, MariaDB, Git y Python..."
sudo dnf install -y docker mariadb105 git python3 python3-pip

# 2. Instalación de Node.js 22 (LTS)
# Esta versión es necesaria para la compatibilidad con Vite y React 18/19
echo "Instalando Node.js 22..."
sudo dnf remove -y nodejs # Eliminamos versiones previas para evitar conflictos
sudo dnf install -y nodejs22

# 3. Instalación de Docker Compose (Binario v2.x)
# Descargamos directamente desde el repositorio oficial para asegurar compatibilidad
echo "Instalando Docker Compose manualmente..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
# Creamos el enlace simbólico para que el comando docker-compose funcione globalmente
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# 4. Instalación de Docker Buildx (Plugin v0.17+)
# Requerido por Docker Compose para construir las imágenes de NearMexBackend
echo "Instalando Docker Buildx..."
mkdir -p ~/.docker/cli-plugins/
curl -L https://github.com/docker/buildx/releases/download/v0.17.1/buildx-v0.17.1.linux-amd64 -o ~/.docker/cli-plugins/docker-buildx
chmod +x ~/.docker/cli-plugins/docker-buildx

# 5. Configuración de servicios y permisos
echo "Configurando servicios y permisos de usuario..."
sudo systemctl start docker
sudo systemctl enable docker
# IMPORTANTE: usermod permite usar docker sin sudo tras reiniciar sesión
sudo usermod -aG docker ec2-user

# 6. Instalación de Librerías de Python y PM2
echo "Instalando dependencias adicionales..."
pip3 install boto3 GitPython
sudo npm install -g pm2

echo "----------------------------------------------------------------"
echo "Entorno listo para NearMex."
echo "IMPORTANTE: Cierra esta terminal (exit) y vuelve a entrar por SSH"
echo "para que los cambios de Node v22 y permisos de Docker surtan efecto."
echo "----------------------------------------------------------------"