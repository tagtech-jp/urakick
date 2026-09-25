# セットアップ手順書（社長手動作業）

**対象**: Oracle Cloud Always Free Tier + Ubuntu 22.04 ARM  
**所要時間**: 約60〜90分（Oracle Cloud 審査時間を除く）

---

## ステップ 1: Oracle Cloud アカウント作成

1. ブラウザで https://www.oracle.com/cloud/free/ を開く
2. 「Start for free」をクリック
3. 必要事項を入力（メールアドレス・住所・クレジットカード）
   - クレジットカードは本人確認のみ。Always Free 枠内では課金されない
   - リージョンは **Japan East (Tokyo)** を選択
4. メール認証を完了させる
5. アカウント有効化まで最大24時間かかる場合がある

---

## ステップ 2: ARM Ampere A1 インスタンス取得

Oracle Cloud コンソールにログイン後:

1. 左上ハンバーガーメニュー → **Compute** → **Instances**
2. **Create instance** をクリック
3. 以下の通り設定:

| 項目 | 設定値 |
|---|---|
| Name | urakick-relay |
| Image | **Canonical Ubuntu 22.04** |
| Shape | **VM.Standard.A1.Flex**（Always Free）|
| OCPU | 4（最大まで無料） |
| Memory | 24 GB（最大まで無料） |
| SSH keys | 「Generate a key pair」→ 秘密鍵（.key）をダウンロード |
| Public IP | Assign |

4. **Create** をクリック → 数分でプロビジョニング完了
5. インスタンス詳細画面で **Public IP address** をメモする（例: 140.xxx.xxx.xxx）

---

## ステップ 3: ファイアウォール（セキュリティリスト）設定

Oracle Cloud のネットワーク側のファイアウォールも開ける必要がある。

1. インスタンス詳細 → **Subnet** リンクをクリック
2. **Security Lists** → **Default Security List** を開く
3. **Add Ingress Rules** で以下2件追加:

| Source CIDR | Protocol | Port Range | 用途 |
|---|---|---|---|
| 0.0.0.0/0 | UDP | 5000-5009 | SRTLA（メンバー接続） |
| 0.0.0.0/0 | TCP | 22 | SSH（管理） |

---

## ステップ 4: SSH 接続

ダウンロードした秘密鍵（.key ファイル）を使って SSH 接続する。

### Windows（PowerShell）の場合

```powershell
# 秘密鍵のパーミッション設定（初回のみ）
icacls "C:\path\to\your.key" /inheritance:r /grant:r "$($env:USERNAME):(R)"

# SSH 接続（IP は自分の VM の Public IP に変える）
ssh -i "C:\path\to\your.key" ubuntu@140.xxx.xxx.xxx
```

### Mac / Linux の場合

```bash
chmod 600 ~/Downloads/your.key
ssh -i ~/Downloads/your.key ubuntu@140.xxx.xxx.xxx
```

接続後、プロンプトが `ubuntu@urakick-relay:~$` になれば成功。

---

## ステップ 5: セットアップスクリプト実行

### 5-1. リポジトリをクローン（または scp でアップロード）

```bash
# VM 上で実行
sudo apt-get install -y git
git clone https://github.com/nikkun22/urakick.git /opt/urakick-relay
```

> GitHub がプライベートリポジトリの場合は SSH キーまたは Personal Access Token が必要。

### 5-2. セットアップスクリプト実行

```bash
cd /opt/urakick-relay
sudo bash server/setup_relay.sh
```

スクリプトは以下を自動実行する（約20〜40分）:
- 依存パッケージのインストール（libsrt-dev, cmake, ffmpeg, ufw, vnstat 等）
- BELABOX srtla のビルドとインストール
- srt-live-server (SLS) のビルドとインストール
- ufw ファイアウォール設定（UDP 5000-5009, TCP 22 開放）
- systemd ユニットの登録・起動

---

## ステップ 6: Stream Key の設定

各メンバーの Kick Stream Key を環境変数に設定する。

```bash
# /etc/srtla-relay.env を作成（root 所有・600 パーミッション）
sudo tee /etc/srtla-relay.env > /dev/null << 'EOF'
KICK_KEY_01=メンバー01のKickストリームキー
KICK_KEY_02=メンバー02のKickストリームキー
KICK_KEY_03=メンバー03のKickストリームキー
KICK_KEY_04=メンバー04のKickストリームキー
KICK_KEY_05=メンバー05のKickストリームキー
KICK_KEY_06=メンバー06のKickストリームキー
KICK_KEY_07=メンバー07のKickストリームキー
KICK_KEY_08=メンバー08のKickストリームキー
KICK_KEY_09=メンバー09のKickストリームキー
KICK_KEY_10=メンバー10のKickストリームキー
EOF
sudo chmod 600 /etc/srtla-relay.env
```

> **絶対禁止**: Stream Key を GitHub・Discord・メモ帳等に貼らない。VM の環境変数のみで管理。

---

## ステップ 7: メンバー別設定生成

VM 上（または手元の Python 環境）で設定生成スクリプトを実行する。

```bash
# --server-host に VM の Public IP を指定
python3 /opt/urakick-relay/server/generate_streamer_config.py \
  --members 10 \
  --server-host 140.xxx.xxx.xxx \
  --dry-run
```

出力された JSON から各メンバーの `ffmpeg_cmd` を確認し、対応する systemd サービスに設定する。

---

## ステップ 8: 動作確認

### サービス状態確認

```bash
sudo systemctl status sls.service
sudo systemctl status 'srtla-rec@*.service'
```

全て `active (running)` になっていることを確認。

### 接続テスト（メンバー1名で試す）

1. メンバー1名に Moblin で `srtla://[VM_IP]:5000` へ接続してもらう
2. VM 上で SLS ログを確認:

```bash
sudo journalctl -u sls.service -f
```

`publisher accepted` のログが出れば受信成功。

3. Kick ダッシュボードで配信が届いていることを確認。

---

## トラブルシューティング

| 症状 | 確認コマンド | 対処 |
|---|---|---|
| 接続できない | `sudo ufw status` | UDP 5000-5009 が ALLOW になっているか確認 |
| SLS が起動しない | `sudo journalctl -u sls.service -n 50` | ポート 9000 が使用中でないか確認 |
| Kick に届かない | `sudo journalctl -u 'srtla-relay-push@*' -n 50` | KICK_KEY_XX の値が正しいか確認 |
| 帯域超過の警告 | `vnstat -m` | 当月アウトバウンド量を確認（10TB 枠） |
