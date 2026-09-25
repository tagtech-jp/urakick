# メンバーデータ管理ガイド

メンバー情報は `members.json` で管理しています。**プログラミング知識なし**で GitHub web エディタから編集できます。

---

## メンバーを追加する方法

### GitHub web editor での手順

1. GitHub で `content/members/members.json` を開く
2. 右上の **鉛筆アイコン**（Edit this file）をクリック
3. `"members"` 配列の **最後の `}` の後にカンマを付けて** 以下を追加:

```json
{
  "slug": "member-slug",
  "name": "表示名",
  "role": "裏キック団 / メンバー",
  "avatar": "https://unavatar.io/x/x_handle_name",
  "streamingPlatforms": [
    {
      "platform": "kick",
      "username": "kick_channel_id",
      "url": "https://kick.com/kick_channel_id"
    }
  ],
  "socials": [
    { "platform": "x", "url": "https://x.com/x_handle_name" }
  ]
}
```

4. 「Commit changes」をクリック → メッセージ入力 → コミット
5. 数分後にサイトが自動更新される

---

## 必須フィールド一覧

| フィールド | 必須 | 書き方 |
|-----------|------|--------|
| `slug` | ✅ | 英小文字・数字・ハイフンのみ。URLに使用。**一度決めたら変更不可** |
| `name` | ✅ | サイトに表示する名前 |
| `role` | ✅ | 団長: `"裏キック団 / 団長"` / 一般: `"裏キック団 / メンバー"` |
| `avatar` | ✅ | X アバター自動取得か、独自画像パスを指定（下記参照） |
| `streamingPlatforms` | ✅ | 配信プラットフォームの配列（Kickは必須） |
| `socials` | ✅ | SNSアカウントの配列（空配列 `[]` も可） |
| `handle` | 任意 | ハンドルネーム |
| `bio` | 任意 | 自己紹介文（カードに表示） |

---

## アバター画像の設定方法

### 方法1: Xアカウントのアバターを自動取得（簡単・推奨）

```json
"avatar": "https://unavatar.io/x/x_handle_name"
```

`x_handle_name` の部分を X の ID（@なし）に変更するだけ。

### 方法2: 独自画像を使う（画質を細かく制御したい場合）

1. 画像ファイルを `public/avatars/` に配置
   - ファイル名: `{kick_username}.png`
   - 推奨サイズ: 512×512px 正方形
2. JSONに設定:

```json
"avatar": "/avatars/zenitu_desu.png"
```

---

## 配信プラットフォームの追加

複数プラットフォームを追加する場合は配列に追記:

```json
"streamingPlatforms": [
  {
    "platform": "kick",
    "username": "kick_id",
    "url": "https://kick.com/kick_id"
  },
  {
    "platform": "youtube",
    "username": "channel_id",
    "url": "https://youtube.com/@channel_id"
  }
]
```

**使える `platform` の値**:
- `"kick"` — Kick（ライブ状態の自動取得に対応）
- `"youtube"` — YouTube Live（ライブ状態の自動取得に対応）
- `"twitch"` — Twitch（【要実装】）
- `"fuwacchi"` — ふわっち（【要実装】）
- `"niconico"` — ニコニコ生放送（【要実装】）
- `"twitcasting"` — ツイキャス（【要実装】）

---

## メンバーを削除する方法

対象メンバーのオブジェクト（`{` から `},` まで）を丸ごと削除してコミット。

**注意**: 前後のカンマが正しく残っているか確認すること（JSON文法エラーの原因になる）。

---

## 卒業・休止メンバーの扱い

現在は `status` フィールドがない設計です。退団メンバーは削除を推奨します。  
「アーカイブとして残したい」場合は、`docs/ROADMAP.md` の機能拡張アイデアに記載のとおり `status` フィールドの追加を検討してください。

---

## 表示順を変える方法

`members.json` の配列内の順番が表示順になります（ライブ中メンバーは自動的に先頭に来ます）。  
GitHub web editor で行を切り取り・貼り付けで順序変更できます。

---

## スマホからの編集（GitHub モバイルアプリ）

1. GitHub アプリを開く
2. `nikkun22/urakick` リポジトリ → `content/members/members.json` を開く
3. 右上の `...` メニュー → 「Edit file」
4. 編集して「Commit changes」

---

## 規模が大きくなったら（30名超）

12名程度であれば1ファイルで管理が容易です。  
30名を超えたら `members/[slug].json`（1メンバー1ファイル）への分割を検討してください。  
その際は `lib/members.ts` の `getMembers()` 関数の変更が必要です（えるぴに連絡）。

---

## JSON が壊れたときの確認方法

1. [jsonlint.com](https://jsonlint.com/) にJSONを貼り付けて文法チェック
2. エラーが出た行のカンマ・クォートを確認する

---

*管理: えるぴ（GitHub: nikkun22）*
