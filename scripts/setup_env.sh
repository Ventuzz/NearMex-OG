#!/bin/bash
# Preparación del entorno

echo "Instalando dependencias base..."
sudo dnf update -y
sudo dnf install -y git python3 python3-pip

# Instalar Docker
echo "Instalando Docker..."
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Instalar Docker Compose
echo "Instalando Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Librerias Python
echo "Instalando librerias de Python..."
sudo pip3 install boto3 GitPython

echo "Entorno listo. CIERRA Y VUELVE A ABRIR TU TERMINAL."