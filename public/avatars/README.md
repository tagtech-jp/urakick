# アバター画像管理ガイド

メンバーのアバター画像を管理するディレクトリです。

---

## ファイル命名規則

```
{プラットフォームユーザー名}.png   ← メイン（必須）
{プラットフォームユーザー名}.webp  ← WebP版（推奨）
```

例: `eseakanyan0928.png` / `eseakanyan0928.webp`

> **注意**: `members/` ディレクトリの旧ファイルは `.deprecated` 拡張子で保持（削除確認待ち）。新規追加はすべて `avatars/` を使用。

---

## 推奨サイズ・形式

| 項目 | 推奨値 |
|-----|-------|
| サイズ | 512×512 px（正方形） |
| 形式 | PNG（メイン）+ WebP（軽量版） |
| PNGサイズ目安 | 300〜500 KB |
| WebPサイズ目安 | 30〜80 KB（PNG比 80〜90% 削減） |
| 縦横比 | 1:1（正方形必須） |

---

## 追加・更新手順

### 新規追加

1. 512×512 の PNG 画像を用意
2. ファイル名を `{ユーザー名}.png` で保存
3. WebP も生成（ffmpeg で変換）:
   ```
   ffmpeg -i {ユーザー名}.png -vf "scale=512:512:flags=lanczos" -quality 85 {ユーザー名}.webp
   ```
4. `content/members/members.json` の `avatar` フィールドを `/avatars/{ユーザー名}.png` に設定
5. GitHub にプッシュ → Vercel に自動デプロイ

### 画像差し替え

1. 同じファイル名で上書き（`.png` / `.webp` 両方）
2. プッシュするだけで自動反映

---

## 現在の登録ファイル

| ファイル | メンバー名 | サイズ |
|--------|----------|-------|
| zenitu_desu.png | 全一（団長） | 約90 KB |
| zenitu_desu.webp | 全一（団長） | — |
| erupi1022.png | えるぴ | 約400 KB |
| erupi1022.webp | えるぴ | — |
| sayachioda.png | おださや | 約200 KB |
| sayachioda.webp | おださや | — |
| eseakanyan0928.png | エセアカにゃん | 410 KB |
| eseakanyan0928.webp | エセアカにゃん | 37.5 KB |

---

*管理: えるぴ（GitHub: nikkun22）*
