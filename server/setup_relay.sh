#!/bin/bash
# SRTLA Relay Server Setup Script
# Target: Ubuntu 22.04 LTS (ARM Ampere A1 - Oracle Cloud Always Free)
# Run as root: sudo bash setup_relay.sh

set -euo pipefail

REPO_DIR="/opt/urakick-relay"
SLS_CONF_SRC="${REPO_DIR}/server/sls.conf.template"
SLS_CONF_DEST="/etc/sls/sls.conf"
SYSTEMD_DIR="/etc/systemd/system"
LOG_DIR="/var/log/sls"
RELAY_USER="nobody"

echo "=== [1/7] パッケージ更新・依存インストール ==="
apt-get update -qq
apt-get install -y \
    git cmake build-essential pkg-config \
    tclsh libssl-dev \
    libsrt-dev \
    ffmpeg \
    ufw \
    vnstat \
    curl

echo "=== [2/7] srtla_rec のビルド (BELABOX/srtla) ==="
if [ ! -f /usr/local/bin/srtla_rec ]; then
    TMP=$(mktemp -d)
    git clone --depth 1 https://github.com/BELABOX/srtla.git "${TMP}/srtla"
    cd "${TMP}/srtla"
    make
    cp srtla_rec /usr/local/bin/srtla_rec
    chmod 755 /usr/local/bin/srtla_rec
    cd /
    rm -rf "${TMP}"
    echo "  srtla_rec インストール完了: $(srtla_rec --version 2>&1 || echo 'ok')"
else
    echo "  srtla_rec は既にインストール済み"
fi

echo "=== [3/7] srt-live-server (SLS) のビルド ==="
if [ ! -f /usr/local/bin/sls ]; then
    TMP=$(mktemp -d)
    git clone --depth 1 https://github.com/Edward-Wu/srt-live-server.git "${TMP}/sls"
    cd "${TMP}/sls"
    make
    cp bin/sls /usr/local/bin/sls
    chmod 755 /usr/local/bin/sls
    cd /
    rm -rf "${TMP}"
    echo "  sls インストール完了"
else
    echo "  sls は既にインストール済み"
fi

echo "=== [4/7] SLS 設定ファイル配置 ==="
mkdir -p /etc/sls "${LOG_DIR}"
if [ ! -f "${SLS_CONF_DEST}" ]; then
    cp "${SLS_CONF_SRC}" "${SLS_CONF_DEST}"
    echo "  SLS 設定配置完了: ${SLS_CONF_DEST}"
else
    echo "  SLS 設定は既に存在（上書きスキップ）: ${SLS_CONF_DEST}"
fi

echo "=== [5/7] ufw ファイアウォール設定 ==="
ufw allow 22/tcp    comment 'SSH'
ufw allow 5000:5009/udp comment 'SRTLA member 01-10'
ufw --force enable
echo "  ufw ルール適用完了"
ufw status numbered

echo "=== [6/7] systemd ユニット登録 ==="
# SLS サービス
cp "${REPO_DIR}/server/systemd/sls.service" "${SYSTEMD_DIR}/sls.service"

# srtla-rec テンプレートユニット（ポート番号をインスタンス名とする）
cp "${REPO_DIR}/server/systemd/srtla-rec.service" "${SYSTEMD_DIR}/srtla-rec@.service"

systemctl daemon-reload

# SLS 起動
systemctl enable --now sls.service

# srtla-rec をポート 5000-5009 で有効化
for PORT in $(seq 5000 5009); do
    systemctl enable --now "srtla-rec@${PORT}.service"
done

echo "=== [7/7] vnstat 初期化 ==="
systemctl enable --now vnstat

echo ""
echo "=== セットアップ完了 ==="
echo "サービス状態を確認してください:"
echo "  sudo systemctl status sls.service"
echo "  sudo systemctl status 'srtla-rec@*.service'"
echo ""
echo "次のステップ:"
echo "  1. /etc/srtla-relay.env に KICK_KEY_01〜KICK_KEY_10 を設定"
echo "  2. python3 ${REPO_DIR}/server/generate_streamer_config.py --members 10 --server-host [VM_IP] --dry-run"
echo "  3. メンバーに QR コードを配布 (docs/moblin_distribution.md 参照)"
