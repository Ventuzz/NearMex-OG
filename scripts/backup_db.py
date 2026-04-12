import boto3
import os
from datetime import datetime

# Configuracion del destino
BUCKET_NAME = 'nearmex-backups-database'
FILE_NAME = f"nearmex_backup_{datetime.now().strftime('%Y%m%d_%H%M')}.sql"

def ejecutar_respaldo():
    # 1. Extraer datos del contenedor de Docker
    # Usamos docker exec para entrar al contenedor y sacar el dump
    print(f"Iniciando respaldo de base de datos: {FILE_NAME}")
    comando_dump = f"docker exec nearmex-db mysqldump -u nearmex_user -pnearmex nearmex_db > {FILE_NAME}"
    
    resultado = os.system(comando_dump)
    
    if resultado == 0:
        # 2. Subir a S3 usando Boto3
        s3 = boto3.client('s3')
        try:
            s3.upload_file(FILE_NAME, BUCKET_NAME, FILE_NAME)
            print(f"Respaldo subido exitosamente a S3: {BUCKET_NAME}")
            # 3. Limpiar el archivo local para no llenar el disco de la EC2
            os.remove(FILE_NAME)
        except Exception as e:
            print(f"Error al subir a S3: {e}")
    else:
        print("Error al generar el volcado de la base de datos.")

if __name__ == "__main__":
    ejecutar_respaldo()