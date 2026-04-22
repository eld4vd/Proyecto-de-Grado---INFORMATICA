#!/bin/bash
# ===========================================
# Script para inicializar certificados SSL con Let's Encrypt
# Basado en: https://github.com/wmnnd/nginx-certbot
# ===========================================
# USO:
#   chmod +x init-letsencrypt.sh
#   sudo ./init-letsencrypt.sh
# ===========================================

set -e

# ── CONFIGURACIÓN (editar estos valores) ──
# Cargar variables desde .env.docker.prod si existe
if [ -f .env.docker.prod ]; then
    export $(grep -v '^#' .env.docker.prod | xargs)
fi

# Dominios para el certificado
domains=(${DOMAIN:-sicabit.webdeploy.tech} www.${DOMAIN:-sicabit.webdeploy.tech})
email="${CERTBOT_EMAIL:-malvaris.d4vd@gmail.com}"

# Rutas de datos
data_path="./certbot"
compose_file="docker-compose.prod.yml"
env_file=".env.docker.prod"

# Usar staging de Let's Encrypt para pruebas (1 = staging, 0 = producción)
# IMPORTANTE: Cambiar a 0 cuando estés seguro de que todo funciona
staging=0

# Fuerza RSA para mayor compatibilidad
rsa_key_size=4096

echo "============================================"
echo "  Inicializando SSL para: ${domains[*]}"
echo "============================================"

# ── Verificar que docker compose esté disponible ──
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    exit 1
fi

# ── Verificar archivo .env ──
if [ ! -f "$env_file" ]; then
    echo "❌ Error: No se encontró $env_file"
    echo "   Ejecuta: cp .env.docker.prod.example .env.docker.prod"
    echo "   Y edita los valores de producción"
    exit 1
fi

# ── Paso 1: Crear directorios necesarios ──
echo ""
echo "📁 Paso 1/5: Creando directorios..."
mkdir -p "$data_path/conf"
mkdir -p "$data_path/www"

# ── Paso 2: Descargar parámetros SSL recomendados ──
if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
    echo "⬇️  Paso 2/5: Descargando parámetros TLS recomendados..."

    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"

    echo "   ✅ Parámetros TLS descargados"
else
    echo "⏭️  Paso 2/5: Parámetros TLS ya existen, omitiendo..."
fi

# ── Paso 3: Crear certificado dummy temporal ──
echo "🔐 Paso 3/5: Creando certificado temporal para iniciar Nginx..."

cert_path="/etc/letsencrypt/live/${domains[0]}"
mkdir -p "$data_path/conf/live/${domains[0]}"

docker compose -f "$compose_file" --env-file "$env_file" run --rm --entrypoint "\
    openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
        -keyout '$cert_path/privkey.pem' \
        -out '$cert_path/fullchain.pem' \
        -subj '/CN=localhost'" certbot

echo "   ✅ Certificado temporal creado"

# ── Paso 4: Iniciar Nginx con certificado temporal ──
echo "🚀 Paso 4/5: Iniciando Nginx con certificado temporal..."

docker compose -f "$compose_file" --env-file "$env_file" up --force-recreate -d nginx
echo "   ⏳ Esperando a que Nginx esté listo..."
sleep 5

# Verificar que Nginx está corriendo
if ! docker compose -f "$compose_file" --env-file "$env_file" ps nginx | grep -q "Up\|running"; then
    echo "❌ Error: Nginx no pudo iniciar. Revisa los logs:"
    echo "   docker compose -f $compose_file --env-file $env_file logs nginx"
    exit 1
fi
echo "   ✅ Nginx está corriendo"

# ── Paso 5: Solicitar certificado real de Let's Encrypt ──
echo "🌐 Paso 5/5: Solicitando certificado SSL de Let's Encrypt..."

# Eliminar certificado dummy
docker compose -f "$compose_file" --env-file "$env_file" run --rm --entrypoint "\
    rm -Rf /etc/letsencrypt/live/${domains[0]} && \
    rm -Rf /etc/letsencrypt/archive/${domains[0]} && \
    rm -Rf /etc/letsencrypt/renewal/${domains[0]}.conf" certbot

# Construir argumentos del dominio (-d para cada dominio)
domain_args=""
for domain in "${domains[@]}"; do
    domain_args="$domain_args -d $domain"
done

# Argumento de staging (para pruebas)
staging_arg=""
if [ $staging != "0" ]; then
    staging_arg="--staging"
    echo "   ⚠️  Usando servidor STAGING de Let's Encrypt (certificado de prueba)"
fi

# Solicitar certificado real
docker compose -f "$compose_file" --env-file "$env_file" run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
        $staging_arg \
        $domain_args \
        --email $email \
        --rsa-key-size $rsa_key_size \
        --agree-tos \
        --no-eff-email \
        --force-renewal" certbot

echo "   ✅ Certificado SSL obtenido correctamente"

# ── Recargar Nginx con certificado real ──
echo ""
echo "🔄 Recargando Nginx con certificado SSL real..."
docker compose -f "$compose_file" --env-file "$env_file" exec nginx nginx -s reload

echo ""
echo "============================================"
echo "  ✅ ¡SSL configurado exitosamente!"
echo "============================================"
echo ""
echo "Tu sitio ahora está disponible en:"
echo "  🌐 https://${domains[0]}"
echo "  🌐 https://${domains[1]}"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Levantar todos los servicios:"
echo "     docker compose -f $compose_file --env-file $env_file up -d --build"
echo "  2. Ejecutar migraciones:"
echo "     docker compose -f $compose_file --env-file $env_file --profile migrate up migrate"
echo "  3. Ejecutar seed (opcional):"
echo "     docker compose -f $compose_file --env-file $env_file --profile seed up seed"
echo ""
echo "🔄 Los certificados se renuevan automáticamente cada 12 horas."
echo ""
