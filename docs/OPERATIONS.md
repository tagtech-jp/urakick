# OPERATIONS — 裏キック団サイト運用マニュアル

**対象読者**: 裏キック団メンバー・運営担当（非エンジニア対応）  
**最終更新**: 2026-05-04  
**本番URL**: https://urakick.vercel.app/  
**リポジトリ**: GitHub nikkun22/urakick

---

## 目次

1. [メンバー追加・更新・削除](#1-メンバー追加更新削除)
2. [掟（ルール）の改定](#2-掟ルールの改定)
3. [配信ステータスの動作確認](#3-配信ステータスの動作確認)
4. [Vercelデプロイ前チェックリスト](#4-vercelデプロイ前チェックリスト)
5. [緊急時のロールバック手順](#5-緊急時のロールバック手順)
6. [LINE送信文テンプレートの運用](#6-line送信文テンプレートの運用)
7. [トラブル時の連絡フロー](#7-トラブル時の連絡フロー)

---

## 1. メンバー追加・更新・削除

### ファイルの場所

```
content/members.ts
```

GitHub上でのURL（例）:  
`https://github.com/nikkun22/urakick/blob/main/content/members.ts`

### メンバー追加の手順（GitHub web editor）

1. GitHubで `content/members.ts` を開く
2. 右上の鉛筆アイコン（Edit this file）をクリック
3. `members` 配列の末尾に以下の形式でメンバー情報を追加：

```typescript
{
  slug: "member-name",          // ← URLに使われる識別子（英数字・ハイフンのみ）
  name: "表示名",               // ← サイトに表示される名前
  role: memberRole,             // ← 団長以外は全員 memberRole を使う
  avatar: "/avatars/kick_username.png",  // ← public/avatars/ 配下に画像を配置する場合
  // または:
  // avatar: "https://unavatar.io/x/x_handle",  // ← X（Twitter）アカウントのアバターを自動取得
  streamingPlatforms: [
    {
      platform: "kick",         // ← "kick" | "youtube" | "twitch" | "fuwacchi" | "niconico" | "twitcasting"
      username: "kick_username", // ← KickのID（URLの末尾の部分）
      url: "https://kick.com/kick_username",
    },
  ],
  socials: [
    { platform: "x", url: "https://x.com/x_handle" },
  ],
},
```

4. ページ下部の「Commit changes」をクリック
5. コミットメッセージを入力（例: `メンバー追加: 〇〇`）
6. 「Commit directly to the main branch」を選択
7. 「Commit changes」をクリック
8. 数分後に https://urakick.vercel.app/ が自動更新される

### アバター画像のルール

| 方法 | 説明 | 推奨場面 |
|------|------|---------|
| `https://unavatar.io/x/x_handle` | Xのプロフィール画像を自動取得 | 通常はこれを使う |
| `/avatars/kick_username.png` | 独自画像を `public/avatars/` に配置 | 画質・表示を細かく制御したい場合 |

**独自画像を使う場合**:
- ファイル形式: `.png`（WebP も同名で `.webp` として同梱推奨）
- 推奨サイズ: 512×512px 正方形
- ファイル名: `{kick_username}.png`
- 配置場所: `public/avatars/` ディレクトリ
- WebP変換: `ffmpeg -i {kick_username}.png -quality 85 {kick_username}.webp`

### メンバー更新の手順

上記と同じ手順で `content/members.ts` を編集。  
変更できる項目: name / role / avatar / streamingPlatforms / socials

### メンバー削除の手順

`members` 配列から対象メンバーのオブジェクト全体（`{` から `},` まで）を削除してコミット。

### チェックリスト（追加・削除時に必ず確認）

- [ ] `slug` が他のメンバーと重複していない
- [ ] `slug` に日本語・スペース・大文字が含まれていない（英数字・ハイフンのみ）
- [ ] KickのURLが正しいか確認（存在するチャンネルか）
- [ ] XのURLが正しいか確認
- [ ] 独自画像の場合、`public/avatars/` にファイルが存在するか確認
- [ ] コミット後 5〜10 分でVercelデプロイが完了するのを確認

---

## 2. 掟（ルール）の改定

### ファイルの場所

```
content/rules/oki-10.mdx
```

GitHub上でのURL（例）:  
`https://github.com/nikkun22/urakick/blob/main/content/rules/oki-10.mdx`

### 改定手順（GitHub web editor）

1. GitHubで `content/rules/oki-10.mdx` を開く
2. 右上の鉛筆アイコン（Edit this file）をクリック
3. ファイル冒頭の `---` と `---` の間（frontmatterと呼ぶ設定部分）を編集：

**条文テキストを変更する場合**:
```yaml
rules:
  - id: 1
    text: "ここを変更する。"   # ← 変更するのはここだけ
    penalty: false
    note: null
```

**条文を追加する場合**（最後に追記）:
```yaml
  - id: 11
    text: "新しい掟のテキスト。"
    penalty: false
    note: "注釈があれば"
```

4. **必ずメタデータも更新する**:
```yaml
改定日: "2026-05-04"      # ← 今日の日付に変更
改定回数: 1               # ← 1 増やす
```

5. 「Commit changes」→ メッセージ入力 → コミット

### 改定履歴の追跡

Gitのコミット履歴が改定記録になります。  
GitHub上で「History」ボタンをクリックすると過去のすべての改定内容を確認できます。

### 過去版の復元方法

1. GitHubのコミット履歴を開く
2. 戻したいコミットを選択
3. 「Revert」ボタンをクリック（エンジニアに依頼推奨）

---

## 3. 配信ステータスの動作確認

### 仕組み

- ブラウザが `/api/live-status` にアクセス → Kick API v2 に問い合わせ → 配信中ならLIVEバッジ表示
- **キャッシュなし**（`Cache-Control: no-store`）でリアルタイム更新
- Kick APIのタイムアウト: 4秒

### 動作確認の手順

1. 配信中のメンバーが存在する時間帯にサイトを開く
2. 該当メンバーのカードに **LIVE** バッジが表示されているか確認
3. カードをクリックして配信ページに遷移するか確認

### APIの直接確認

ブラウザで以下のURLにアクセス（JSONが返る）:
```
https://urakick.vercel.app/api/live-status
```

返ってくるデータの例:
```json
{
  "statuses": {
    "zenichi": { "isLive": true, "platform": "kick", "viewers": 45 },
    "erupi": { "isLive": false }
  },
  "fetchedAt": 1746345600000
}
```

### トラブルシューティング

| 症状 | 原因候補 | 対処 |
|------|---------|------|
| 配信中なのにLIVEが出ない | Kick APIの一時障害 | 5分後に再確認 |
| 全員LIVEが出ない | Kick APIのレート制限 | エンジニアに連絡 |
| サイト自体が表示されない | Vercelの障害 | Vercel Status確認 |

---

## 4. Vercelデプロイ前チェックリスト

mainブランチにpushすると自動デプロイされますが、以下を事前確認：

- [ ] **文字コード**: 日本語は UTF-8 で保存されているか
- [ ] **YAML形式**: `oki-10.mdx` の frontmatter が崩れていないか（インデントは半角スペース2個）
- [ ] **slug重複なし**: 全メンバーの slug が一意か
- [ ] **画像存在確認**: `avatar: "/members/..."` を使っている場合、ファイルが存在するか
- [ ] **URL正確性**: KickのURL・XのURLがすべてアクセス可能か
- [ ] **デプロイ完了確認**: pushから5〜10分後にサイトを開いて変更を目視確認

---

## 5. 緊急時のロールバック手順

### Vercel ダッシュボードからのロールバック

1. https://vercel.com にログイン
2. `urakick` プロジェクトを開く
3. 「Deployments」タブを開く
4. 問題が起きる前の正常なデプロイを探す
5. 対象デプロイの `...` メニューから「Promote to Production」をクリック
6. 即時反映（数秒）

### GitHub からの revert

エンジニア担当に依頼：
```bash
git revert <問題のコミットハッシュ>
git push origin main
```

---

## 6. LINE送信文テンプレートの運用

`docs/sponsor_line_message.txt` に配信中継サーバー導入提案の LINE 送信文があります。

**運用ルール**:
- 送信前に全一団長に必ず内容を確認してもらう
- 金額・プランを変更する場合は `docs/sponsor_estimate_relay_server.md` も同時に更新
- 送信後の意思決定（A案 or C案）を `docs/relay_server_decision.md`（要作成）に記録

---

## 7. トラブル時の連絡フロー

| 問題 | 連絡先 | 手段 |
|------|--------|------|
| サイトが表示されない | えるぴ（サイト管理者） | Xの DM または Discord |
| LIVEバッジが動かない | えるぴ（サイト管理者） | Xの DM または Discord |
| メンバー情報を間違えた | えるぴ（サイト管理者） | Xの DM または Discord |
| Kick APIの大規模障害 | 全一団長 + えるぴ | Discord |

---

*最終更新: 2026-05-04 / 管理: えるぴ*
