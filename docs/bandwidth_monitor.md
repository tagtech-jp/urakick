# 帯域監視手順

**ツール**: vnstat  
**目的**: Oracle Cloud Always Free Tier の月間10TB アウトバウンド枠の使用量管理

---

## インストール（setup_relay.sh で自動実行済み）

```bash
sudo apt-get install -y vnstat
sudo systemctl enable vnstat --now
```

インストール直後は統計収集が始まっていないため、数分後に確認する。

---

## 基本コマンド

### 月次サマリー（最重要）

```bash
vnstat -m
```

出力例:
```
 ens3  /  monthly

       month        rx      |     tx      |    total    |   avg. rate
    ------------------------+-------------+-------------+---------------
      2026-05    234.56 GiB |   1.23 TiB  |   1.46 TiB  |   4.62 Mbit/s
    ------------------------+-------------+-------------+---------------
    estimated    312.00 GiB |   1.64 TiB  |   1.95 TiB  |
```

- **tx**（送信・アウトバウンド）を Oracle 10TB 枠と照合する
- **estimated** が当月末予測値

### 日次サマリー

```bash
vnstat -d
```

### リアルタイムレート

```bash
vnstat -l
```

Ctrl+C で終了。配信中に実行してピーク帯域を確認する。

### 時間帯別

```bash
vnstat -h
```

---

## 帯域アラート基準

| 使用量（月間 tx） | 状態 | アクション |
|---|---|---|
| 〜4TB | 正常 | 変更不要 |
| 4〜7TB | 注意 | 配信時間・人数を確認 |
| 7〜9TB | 警告 | 配信本数を絞る・社長に報告 |
| 9TB 超 | 危険 | 即日配信を停止し帯域リセットを待つ |

> Oracle Cloud は 10TB 超過後も課金ではなくスロットリング（速度制限）になる場合が多いが、規約上は超過課金の可能性があるため要注意。

---

## cron による日次チェック（任意設定）

```bash
sudo crontab -e
```

以下を追記:
```
# 毎日 09:00 に月次帯域サマリーをログ出力
0 9 * * * /usr/bin/vnstat -m >> /var/log/vnstat_daily.log 2>&1
```

将来的に Discord 通知を追加する場合は、このスクリプトから webhook を叩くように拡張する。

---

## インターフェース名の確認

vnstat はネットワークインターフェース名を自動検出するが、複数ある場合は指定が必要。

```bash
ip link show
```

Oracle Cloud の ARM VM では通常 `ens3` または `enp0s3` が外部インターフェース。

```bash
# インターフェースを指定する場合
vnstat -i ens3 -m
```
