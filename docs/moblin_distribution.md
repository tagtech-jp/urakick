# Moblin プロファイル配布手順（メンバー向け）

**対象**: Moblin アプリ（iOS）を使用するメンバー  
**前提**: VM の Public IP とメンバーごとの SRTLA ポート番号が確定していること

---

## QR コードの生成

手元の PC（Python 3.8 以上）で以下を実行する。

### 事前準備（初回のみ）

```bash
pip install qrcode[pil]
```

### メンバー1人分のQRコードを生成

```bash
python client/generate_moblin_qr.py \
  --member-id 1 \
  --srt-host 140.xxx.xxx.xxx \
  --port 5000 \
  --stream-id live/5000 \
  --output stream_keys/member01_qr.png
```

| 引数 | 内容 |
|---|---|
| `--member-id` | メンバー番号（1〜10） |
| `--srt-host` | Oracle VM の Public IP |
| `--port` | メンバーごとのポート（member 1 = 5000 … member 10 = 5009） |
| `--stream-id` | SLS stream ID（`live/{ポート番号}`） |
| `--output` | 出力先 PNG パス（`stream_keys/` 以下は git 除外済み） |

### 10名分を一括生成する場合

```bash
for i in $(seq 1 10); do
  PORT=$((4999 + i))
  python client/generate_moblin_qr.py \
    --member-id $i \
    --srt-host 140.xxx.xxx.xxx \
    --port $PORT \
    --stream-id "live/$PORT" \
    --output "stream_keys/member$(printf '%02d' $i)_qr.png"
done
```

> **注意**: 生成した PNG は `stream_keys/` に保存される。このディレクトリは `.gitignore` で git 除外済みのため、誤って GitHub にプッシュされることはない。

---

## メンバーへの配布方法

### 推奨: LINE または Discord DM で個別送付

- 各メンバーに **個人の QR コードのみ** を送る（他メンバーの QR を共有しない）
- QR には接続先 IP とポートが含まれるため、取り扱い注意

### Moblin 側の操作手順（メンバー向け）

1. iPhone で **Moblin** アプリを開く
2. 右上の設定アイコン → **Stream** タブ
3. **URL** フィールドに `srtla://[VM_IP]:[ポート]` を入力  
   （QR コードをカメラで読み取れる場合はスキャン）
4. **Stream ID** フィールドに `live/[ポート番号]` を入力
5. **Bitrate** を 6000 kbps（6Mbps）以下に設定
6. 配信開始 → VM 管理者にログで受信確認を依頼

---

## QR コードの内容（エンコード形式）

生成される QR コードには以下の形式の URL がエンコードされる:

```
srtla://[srt-host]:[port]?streamId=[stream-id]
```

例:
```
srtla://140.xxx.xxx.xxx:5000?streamId=live/5000
```

Moblin の「Import via QR」機能でスキャンすると、接続設定が自動入力される。

---

## Stream Key の扱い（重要）

Kick の Stream Key は QR コードには **含まれない**。  
Stream Key は VM 側の環境変数（`/etc/srtla-relay.env`）のみで管理し、メンバーへの共有は不要。  
メンバーは SRTLA 接続先（IP・ポート・stream ID）だけ知っていれば配信できる。
