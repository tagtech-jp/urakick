# ARCHITECTURE — 裏キック団サイト システム設計書

**最終更新**: 2026-05-04  
**技術スタック**: Next.js 16.2.4（App Router）/ React 19 / TypeScript 5 / Tailwind CSS v4 / Vercel

---

## 目次

1. [サイト全体構成](#1-サイト全体構成)
2. [ページ一覧と責務](#2-ページ一覧と責務)
3. [データアーキテクチャ](#3-データアーキテクチャ)
4. [Kick API ライブステータス連携](#4-kick-api-ライブステータス連携)
5. [掟10条のMDXアーキテクチャ](#5-掟10条のmdxアーキテクチャ)
6. [デザインシステム](#6-デザインシステム)
7. [ディレクトリ構造の設計意図](#7-ディレクトリ構造の設計意図)
8. [デプロイフロー](#8-デプロイフロー)
9. [PF拡張の手順](#9-pf拡張の手順)

---

## 1. サイト全体構成

```
ブラウザ
  ↓
Vercel Edge Network (CDN)
  ↓
Next.js App Router (Vercel Functions)
  ├── Static Pages: /, /about, /rules, /contact, /members
  │     └── ビルド時にHTMLを生成（高速・低コスト）
  └── Edge API: /api/live-status
        └── リクエスト毎に Kick API v2 に問い合わせ（リアルタイム）
```

### レンダリング戦略

| ページ | 種別 | 理由 |
|--------|------|------|
| `/` | Static | コンテンツが固定 |
| `/about` | Static | コンテンツが固定 |
| `/rules` | Static | MDXファイルをビルド時に読み込み |
| `/members` | Static | メンバーデータはビルド時に確定 |
| `/contact` | Static | コンテンツが固定 |
| `/api/live-status` | Edge Dynamic | リアルタイムAPI取得が必要 |

`/members` ページはStatic生成だが、ライブステータスはクライアントサイドで `/api/live-status` を呼び出す。これにより:
- ページ初期表示は高速（Staticキャッシュ）
- ライブ状態はリアルタイム更新

---

## 2. ページ一覧と責務

### ページ遷移図

```
/ (トップ)
├─ /members  → メンバーカードクリック → kick.com/{username}（外部遷移）
├─ /rules
├─ /about
└─ /contact
```

### 各ページの責務

| ファイル | ページ | 主な責務 |
|---------|--------|---------|
| `app/page.tsx` | トップ | 活動内容紹介（3カード）＋ライブステータスサマリー |
| `app/members/page.tsx` | メンバー一覧 | 全メンバーのカード表示＋LIVEバッジ |
| `app/rules/page.tsx` | 掟 | `content/rules/oki-10.mdx` からルール取得して表示 |
| `app/about/page.tsx` | About | 団体説明・LIVEバッジの説明 |
| `app/contact/page.tsx` | コンタクト | ファン向け（XのDM）・ビジネス向け（団長X）の2パターン |
| `app/layout.tsx` | 全ページ共通 | Header・Footer でラップ |

---

## 3. データアーキテクチャ

### メンバーデータ（members.ts）

```
content/members.ts
  └── 型定義: Member, StreamingHandle, StreamingPlatform, SocialPlatform
  └── 実データ: members[] (12名)
       ↓ import
  components/live-members-grid.tsx
       ↓
  lib/live-status.ts  →  Kick API v2
```

**型の意図**:
- `StreamingPlatform`: 対応予定の全6PFを型レベルで定義済み（実装は Kick のみ）
- `avatarFor(handle)`: X APIを使わず unavatar.io 経由でアバター取得（無認証）

### ルールデータ（MDX）

```
content/rules/oki-10.mdx
  └── frontmatter（YAML）: メタデータ + rules[]
       ↓ gray-matter でパース
  lib/rules.ts → getRules()
       ↓ import（Server Component）
  app/rules/page.tsx（Static生成）
```

### ライブステータスデータ（Kick API）

```
ブラウザ
  ↓ fetch /api/live-status（Cache-Control: no-store）
app/api/live-status/route.ts（Edge Runtime）
  ↓ getLiveStatusBulk(members)
lib/live-status.ts
  ↓ 並列 fetchWithTimeout（4秒タイムアウト）
https://kick.com/api/v2/channels/{username}
```

---

## 4. Kick API ライブステータス連携

### エンドポイント

```
GET https://kick.com/api/v2/channels/{username}
```

- 認証: 不要（公開API）
- レスポンス: チャンネル情報 + `livestream` フィールド

### レスポンス構造（ライブ中の場合）

```json
{
  "livestream": {
    "is_live": true,
    "session_title": "配信タイトル",
    "viewer_count": 42,
    "thumbnail": { "url": "https://..." }
  }
}
```

### 実装上の工夫

1. **4秒タイムアウト**: Kick APIが遅い場合はnullを返して`isLive: false`扱いにする
2. **User-Agent 偽装**: デフォルトfetchはKickにブロックされるためブラウザUAを設定
3. **並列処理**: 全メンバーを `Promise.all` で並列チェック（逐次処理より高速）
4. **エラー握りつぶし**: APIエラーはサイトを壊さず `isLive: false` にフォールバック

### 将来のPF拡張手順

`lib/live-status.ts` の `checkPlatform()` に以下を追加するだけで拡張できる:

```typescript
async function checkYouTube(handle: StreamingHandle): Promise<LiveStatus | null> {
  // YouTube Data API v3 実装
}

// checkPlatform() に追加:
case "youtube":
  return checkYouTube(handle);
```

**注意**: YouTube はAPIキーが必要。Vercel の環境変数に `YOUTUBE_API_KEY` を設定する。

---

## 5. 掟10条のMDXアーキテクチャ

### 変更前（2026-05-04以前）

```
app/rules/page.tsx
  └── const RULES: string[] = ["メンバー同士で揉めないこと。", ...]  // TSに直書き
```

- 問題: 条文変更にTypeScriptの知識が必要
- 問題: 変更履歴がコードのcommit履歴と混在

### 変更後（2026-05-04以降）

```
content/rules/oki-10.mdx
  └── frontmatter（YAML）
       ├── メタデータ: 制定日・改定日・改定回数・適用範囲・罰則方針
       └── rules[]: { id, text, penalty, note }[]
            ↓ fs.readFileSync + gray-matter
       lib/rules.ts → getRules() → RuleData
            ↓ 静的インポート（Server Component）
       app/rules/page.tsx（ビルド時にHTML生成）
```

### 設計のトレードオフ

| 観点 | MDX frontmatter方式（現在） | next-mdx-remote方式（代替案） |
|------|--------------------------|----------------------------|
| 実装の複雑さ | 低（gray-matter + fs） | 中（MDXレンダラーの設定） |
| 非エンジニア編集性 | ✅ YAMLの配列を編集するだけ | △ JSX記法が必要 |
| 将来の拡張性 | 中（本文はMarkdownのみ） | 高（JSXコンポーネント埋め込み可） |
| 適用場面 | 構造化データ（rules[]） | リッチコンテンツ（画像・コンポーネント混在） |

**現在の用途（条文リスト）には frontmatter方式が最適**。  
本文をリッチにする必要が出た場合は `next-mdx-remote` への移行を検討。

---

## 6. デザインシステム

### カラーパレット（`app/globals.css`）

| CSS変数 | 値 | 用途 |
|--------|-----|------|
| `--accent-kick` | `#53fc18` | Kickブランドカラー（グリーン）。アクセント全般 |
| `--accent-pink` | `#ff4dd2` | LIVEバッジ・強調表示 |
| `--background` | `#0b0d0f` | ページ背景 |
| `--card` | `#131517` | カード背景 |
| `--muted-foreground` | `#9ca3af` | 補足テキスト |
| `--border` | `#262a2f` | ボーダー |

### フォント（`app/layout.tsx` で設定）

| 変数 | フォント | 用途 |
|------|--------|------|
| `--font-sans` | Noto Sans JP | 本文 |
| `--font-mono` | JetBrains Mono | コード等 |
| `--font-display` | RockNRoll One | 見出し（装飾） |

### Tailwind CSS v4 の特徴

このプロジェクトは **Tailwind CSS v4** を使用（v3とはAPIが異なる点に注意）:
- `@import "tailwindcss"` を使う（v3の `@tailwind` ではない）
- `@theme inline { }` でカスタムCSS変数とTailwindトークンをマッピング
- `tailwind.config.js` は存在しない（設定はCSSで完結）

---

## 7. ディレクトリ構造の設計意図

```
D:\urakick\
├── app/              # Next.js App Routerのページ・API
│   ├── api/          # Edge APIエンドポイント（サーバーサイド専用）
│   └── [page]/       # 各ページのpage.tsx（Server Components）
├── components/       # 再利用可能なUIコンポーネント
│   ├── hero.tsx              ← ページ固有だが再利用性高い
│   ├── live-members-grid.tsx ← クライアントコンポーネント（LIVE状態管理）
│   ├── live-status-card.tsx  ← トップページ用サマリーカード
│   ├── member-card.tsx       ← メンバー個人カード
│   ├── site-header.tsx       ← グローバルナビ
│   ├── site-footer.tsx       ← グローバルフッター
│   ├── kick-icon.tsx         ← SVGアイコン
│   └── x-icon.tsx            ← SVGアイコン
├── content/          # 非エンジニアが編集するコンテンツファイル
│   ├── members.ts            ← メンバーデータ（TypeScript）
│   └── rules/
│       ├── oki-10.mdx        ← 掟10条（YAML frontmatter + Markdown body）
│       └── README.md         ← 編集手順書
├── lib/              # ビジネスロジック・ユーティリティ
│   ├── live-status.ts        ← Kick API連携（Server Component用）
│   ├── rules.ts              ← MDX読み込みローダー（Server Component用）
│   └── utils.ts              ← clsx + twMerge ユーティリティ
├── docs/             # 設計・運用文書（このファイルもここ）
│   ├── ARCHITECTURE.md
│   ├── OPERATIONS.md
│   ├── ROADMAP.md
│   ├── sponsor_estimate_relay_server.md
│   └── sponsor_line_message.txt
└── public/           # 静的ファイル（画像・動画等）
    ├── members/      ← メンバーアバター画像（独自画像使用時）
    ├── hero.mp4      ← トップページ背景動画
    └── hero-poster.jpg ← 動画ロード前のポスター画像
```

### `content/` と `lib/` の分離

- `content/`: **データ**（変更頻度高・非エンジニアが編集）
- `lib/`: **ロジック**（変更頻度低・エンジニアが編集）
- この分離により、コンテンツ変更がコードレビューを不要にする

---

## 8. デプロイフロー

```
ローカル編集 または GitHub web editor
  ↓ git push → main ブランチ
GitHub（nikkun22/urakick）
  ↓ Webhook
Vercel（自動ビルド・デプロイ）
  ├── npm run build（Next.js Turbopack）
  ├── TypeScript 型検査
  ├── 静的ページ生成（/, /about, /rules, /members, /contact）
  └── Edge Function デプロイ（/api/live-status）
  ↓ 約3〜5分
https://urakick.vercel.app/ に反映
```

---

## 9. PF拡張の手順

新しい配信PFのライブステータス対応を追加する場合:

### Step 1: `content/members.ts` の型に追加済みか確認

```typescript
type StreamingPlatform = "kick" | "youtube" | "twitch" | "fuwacchi" | "niconico" | "twitcasting"
```

既存の型に含まれていればStep 3へ。新しいPFならStep 2から。

### Step 2: 型に追加（新PFの場合のみ）

```typescript
type StreamingPlatform = "kick" | "youtube" | "twitch" | ... | "newplatform"
```

### Step 3: `lib/live-status.ts` に実装追加

```typescript
async function checkNewPlatform(handle: StreamingHandle): Promise<LiveStatus | null> {
  const res = await fetchWithTimeout(`https://api.newplatform.com/channels/${handle.username}`);
  if (!res || !res.ok) return null;
  // ... レスポンスをパースして LiveStatus を返す
}

// checkPlatform() に case 追加:
case "newplatform":
  return checkNewPlatform(handle);
```

### Step 4: `content/members.ts` でメンバーに設定

```typescript
streamingPlatforms: [
  {
    platform: "newplatform",
    username: "their_username",
    url: "https://newplatform.com/their_username",
  },
],
```

---

*最終更新: 2026-05-04 / 管理: えるぴ*
