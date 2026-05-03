#!/bin/bash
# =============================================================
# Taro Insight — deploy script for Ubuntu VPS
# Run as root: bash deploy.sh
# =============================================================
set -e

APP_DIR="/var/www/taro-insight"
DOMAIN="taroinsight.space"
NODE_VERSION="22"

echo "=== [1/7] Installing system dependencies ==="
apt-get update -q
apt-get install -y curl git nginx certbot python3-certbot-nginx

echo "=== [2/7] Installing Node.js $NODE_VERSION ==="
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi
node -v && npm -v

echo "=== [3/7] Installing PM2 ==="
npm install -g pm2 2>/dev/null || true
pm2 -v

echo "=== [4/7] Cloning / updating app ==="
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull origin master
else
  git clone https://github.com/stokth/astral-insight "$APP_DIR"
  cd "$APP_DIR"
fi

echo "=== [5/7] Installing npm packages ==="
cd "$APP_DIR"
npm ci --production=false

echo "=== [6/7] Writing .env.local ==="
cat > "$APP_DIR/.env.local" <<ENV
NEXT_PUBLIC_SUPABASE_URL=https://qwyitztwzwxkpebedibr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_umX6qGFrxi-x2YXE_ZI1vw_VA9IUg5b
SUPABASE_SERVICE_ROLE_KEY=REPLACE_ME
YOOKASSA_SHOP_ID=REPLACE_ME
YOOKASSA_SECRET_KEY=REPLACE_ME
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
ENV
echo "⚠  Fill in SUPABASE_SERVICE_ROLE_KEY, YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY in $APP_DIR/.env.local"

echo "=== [7a/7] Building Next.js ==="
cd "$APP_DIR"
npm run build

echo "=== [7b/7] Starting with PM2 ==="
pm2 delete taro-insight 2>/dev/null || true
pm2 start npm --name taro-insight -- start
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

echo "=== [7c/7] Configuring Nginx ==="
cat > /etc/nginx/sites-available/taro-insight <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/taro-insight /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "=== [7d/7] SSL via Let's Encrypt ==="
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m admin@$DOMAIN || \
  echo "⚠  SSL failed — point DNS to this server first, then run: certbot --nginx -d $DOMAIN -d www.$DOMAIN"

echo ""
echo "✅ Done! App running at https://$DOMAIN"
echo "   PM2 status: pm2 list"
echo "   App logs:   pm2 logs taro-insight"
echo ""
echo "⚠  Don't forget to fill in the secrets in $APP_DIR/.env.local and restart:"
echo "   pm2 restart taro-insight"
