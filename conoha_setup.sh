#!/bin/bash
# ================================================================
# sugaku-club.com — ConoHa VPS 完全セットアップスクリプト
# ポート25メール送信 + Oracle Cloudからの移行対応
# 
# 使い方:
#   ConoHa VPS (Ubuntu 22.04) にSSHログイン後:
#   curl -fsSL https://raw.githubusercontent.com/nisikawa1533-wq/captcha/main/conoha_setup.sh | sudo bash
# ================================================================
set -e
export DEBIAN_FRONTEND=noninteractive

DOMAIN="sugaku-club.com"
MAIL_FROM="noreply@sugaku-club.com"
APP_DIR="/home/ubuntu/sugaku-web-api"
HTML_DIR="/var/www/html"
DB_DIR="/var/lib/sugaku"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
err()  { echo -e "${RED}[ER]${NC} $1"; }

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  sugaku-club.com — ConoHa VPS Setup     ║"
echo "║  ポート25メール対応・完全移行版           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

MY_IP=$(curl -s ifconfig.me)
log "サーバーIP: $MY_IP"

# ── 1. システム更新 ────────────────────────────────────────
log "[1/9] システム更新..."
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq \
  nginx certbot python3-certbot-nginx apache2-utils \
  curl wget git unzip sqlite3 \
  postfix mailutils libsasl2-modules \
  opendkim opendkim-tools \
  fail2ban ufw

# ── 2. Node.js 22 + PM2 ───────────────────────────────────
log "[2/9] Node.js 22 + PM2..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - 2>/dev/null
  apt-get install -y nodejs
fi
npm install -g pm2 --silent

# ── 3. UFW ────────────────────────────────────────────────
log "[3/9] ファイアウォール（UFW）..."
ufw --force reset 2>/dev/null
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 25/tcp    # ConoHaはポート25が使える！
ufw allow 587/tcp   # SMTP Submission
ufw --force enable
log "  UFW: 22/80/443/25/587 開放"

# ── 4. Postfix（ポート25直接送信） ─────────────────────────
log "[4/9] Postfix セットアップ..."
debconf-set-selections <<< "postfix postfix/mailname string $DOMAIN"
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"

cat > /etc/postfix/main.cf << POSTFIX_CONF
# sugaku-club.com — ConoHa VPS Postfix設定
myhostname = mail.$DOMAIN
mydomain = $DOMAIN
myorigin = \$mydomain
inet_interfaces = loopback-only
inet_protocols = all
mydestination = localhost
relayhost =
mynetworks = 127.0.0.0/8 [::1]/128
smtp_use_tls = yes
smtp_tls_security_level = may
smtp_tls_loglevel = 1
smtpd_tls_security_level = may

# DKIM連携
milter_default_action = accept
milter_protocol = 6
smtpd_milters = inet:localhost:12301
non_smtpd_milters = inet:localhost:12301

# 送信制限（スパム対策）
default_destination_concurrency_limit = 5
smtp_destination_rate_delay = 0
message_size_limit = 10240000
mailbox_size_limit = 0
POSTFIX_CONF

systemctl restart postfix && systemctl enable postfix
log "  Postfix OK"

# ── 5. OpenDKIM ────────────────────────────────────────────
log "[5/9] DKIM鍵生成..."
mkdir -p /etc/opendkim/keys/$DOMAIN
cd /etc/opendkim/keys/$DOMAIN

if [ ! -f mail.private ]; then
  opendkim-genkey -s mail -d $DOMAIN
  chown -R opendkim:opendkim /etc/opendkim/keys
fi

cat > /etc/opendkim.conf << DKIM_CONF
AutoRestart             Yes
AutoRestartRate         10/1h
Syslog                  yes
SyslogSuccess           Yes
LogWhy                  Yes
Canonicalization        relaxed/simple
ExternalIgnoreList      refile:/etc/opendkim/TrustedHosts
InternalHosts           refile:/etc/opendkim/TrustedHosts
KeyTable                refile:/etc/opendkim/KeyTable
SigningTable            refile:/etc/opendkim/SigningTable
Mode                    sv
PidFile                 /var/run/opendkim/opendkim.pid
SignatureAlgorithm      rsa-sha256
UserID                  opendkim:opendkim
Socket                  inet:12301@localhost
DKIM_CONF

printf "127.0.0.1\nlocalhost\n*.$DOMAIN\n" > /etc/opendkim/TrustedHosts
echo "mail._domainkey.$DOMAIN $DOMAIN:mail:/etc/opendkim/keys/$DOMAIN/mail.private" > /etc/opendkim/KeyTable
echo "*@$DOMAIN mail._domainkey.$DOMAIN" > /etc/opendkim/SigningTable

systemctl restart opendkim && systemctl enable opendkim
systemctl restart postfix
log "  DKIM OK"

# ── 6. アプリディレクトリ + HTMLファイル ──────────────────
log "[6/9] アプリケーション取得..."
mkdir -p $DB_DIR $HTML_DIR $APP_DIR
chown ubuntu:ubuntu $DB_DIR $APP_DIR

cd $HTML_DIR
REPO="https://raw.githubusercontent.com/nisikawa1533-wq/captcha/main"
for f in index.html pricing.html signup.html captcha.html dashboard.html admin.html docs.html; do
  curl -fsSL "$REPO/$f" -o "$f" 2>/dev/null && log "  $f" || warn "  $f (スキップ)"
done
chown -R www-data:www-data $HTML_DIR

# package.json
cat > $APP_DIR/package.json << 'PKG'
{
  "name": "sugaku-web-api",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "better-sqlite3": "^12.10.0",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "nodemailer": "^6.10.1",
    "stripe": "^18.0.0"
  }
}
PKG

# index.js をGitHubから取得（なければスキップ）
curl -fsSL "https://raw.githubusercontent.com/nisikawa1533-wq/captcha/main/index.js" -o $APP_DIR/index.js 2>/dev/null || warn "  index.js: GitHubに未公開 → 後でSCPで転送"

chown -R ubuntu:ubuntu $APP_DIR
cd $APP_DIR && sudo -u ubuntu npm install --omit=dev --silent
log "  npm install OK"

# ── 7. Nginx設定 ───────────────────────────────────────────
log "[7/9] Nginx設定..."

# Basic Auth 用パスワード生成
BASIC_PW=$(openssl rand -base64 12 | tr -d '+=/')
htpasswd -cb /etc/nginx/.htpasswd admin "$BASIC_PW" 2>/dev/null

cat > /etc/nginx/sites-available/sugaku << 'NGINX'
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

server {
    listen 80;
    listen [::]:80;
    server_name sugaku-club.com www.sugaku-club.com;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 管理者ページ（Basic Auth）
    location = /admin.html {
        auth_basic "Restricted";
        auth_basic_user_file /etc/nginx/.htpasswd;
        root /var/www/html;
        try_files $uri =404;
    }

    # 管理者API（Basic Auth）
    location /api/admin/ {
        auth_basic "Restricted";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 課金API
    location /api/billing/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # CAPTCHA API
    location /api/captcha/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 数学問題API
    location /api/math/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 認証API（レート制限）
    location /api/auth/ {
        limit_req zone=auth burst=5 nodelay;
        limit_req_status 429;
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # ユーザーAPI
    location /api/user/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静的ファイル
    location ~* \.(html|js|css|svg|png|ico|webp)$ {
        root /var/www/html;
        try_files $uri =404;
        expires 1h;
    }

    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ =404;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/sugaku /etc/nginx/sites-enabled/sugaku
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
log "  Nginx OK"

# ── 8. PM2 + 環境変数設定 ─────────────────────────────────
log "[8/9] PM2 起動..."
ADMIN_PW=$(openssl rand -base64 16 | tr -d '+=/')

sudo -u ubuntu pm2 set sugaku-user-api:ADMIN_PASSWORD "$ADMIN_PW" 2>/dev/null || true
sudo -u ubuntu pm2 set sugaku-user-api:MAIL_FROM "$MAIL_FROM" 2>/dev/null || true
sudo -u ubuntu pm2 set sugaku-user-api:MAIL_TRANSPORT "postfix" 2>/dev/null || true
sudo -u ubuntu pm2 set sugaku-user-api:BANK_NAME "【後で設定】" 2>/dev/null || true

if [ -f "$APP_DIR/index.js" ]; then
  sudo -u ubuntu pm2 delete sugaku-user-api 2>/dev/null || true
  sudo -u ubuntu pm2 start $APP_DIR/index.js --name sugaku-user-api
  sudo -u ubuntu pm2 save
  env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | bash || true
  log "  PM2 起動OK"
else
  warn "  index.js なし → SCPで転送後に手動起動してください"
fi

# ── 9. Fail2ban ────────────────────────────────────────────
log "[9/9] Fail2ban..."
cat > /etc/fail2ban/jail.local << 'F2B'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5

[sshd]
enabled  = true
maxretry = 3

[nginx-http-auth]
enabled  = true
port     = http,https

[postfix]
enabled  = true
port     = smtp,465,587
F2B

systemctl restart fail2ban && systemctl enable fail2ban
log "  Fail2ban OK"

# ── 完了メッセージ ─────────────────────────────────────────
DKIM_RECORD=$(cat /etc/opendkim/keys/$DOMAIN/mail.txt | tr -d '\n' | sed 's/\s\+/ /g')

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              セットアップ完了！                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【admin.html Basic Auth ログイン情報】"
echo "  ユーザー名 : admin"
echo "  パスワード : $BASIC_PW"
echo ""
echo "【管理者ダッシュボード パスワード】"
echo "  パスワード : $ADMIN_PW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "【DNSに追加するレコード】"
echo "  A    $DOMAIN          → $MY_IP"
echo "  A    www.$DOMAIN      → $MY_IP"
echo "  A    mail.$DOMAIN     → $MY_IP"
echo "  MX   $DOMAIN          → mail.$DOMAIN  (priority 10)"
echo "  TXT  $DOMAIN          → \"v=spf1 ip4:$MY_IP ~all\""
echo "  TXT  _dmarc.$DOMAIN   → \"v=DMARC1; p=quarantine; rua=mailto:contact@$DOMAIN\""
echo ""
echo "  【DKIM】 mail._domainkey.$DOMAIN に以下のTXTレコード:"
cat /etc/opendkim/keys/$DOMAIN/mail.txt
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【Oracle Cloud からのデータ移行】"
echo "  # 旧サーバーで実行:"
echo "  scp /var/lib/sugaku/users.db ubuntu@$MY_IP:/var/lib/sugaku/"
echo "  scp /var/lib/sugaku/jwt_secret.bin ubuntu@$MY_IP:/var/lib/sugaku/"
echo "  scp /home/ubuntu/sugaku-web-api/index.js ubuntu@$MY_IP:/home/ubuntu/sugaku-web-api/"
echo "  # 新サーバーで実行:"
echo "  cd /home/ubuntu/sugaku-web-api && npm install"
echo "  pm2 restart sugaku-user-api"
echo ""
echo "【SSL取得（DNS変更後）】"
echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m contact@$DOMAIN"
echo ""
echo "【メール疎通テスト】"
echo "  echo 'テスト送信' | mail -s 'ConoHa メールテスト' contact@$DOMAIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "VPS費用: 月額約880円 = ホビープラン2件(¥480×2)で黒字"
echo ""