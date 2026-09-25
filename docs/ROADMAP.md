# ROADMAP — 裏キック団サイト 開発・運営ロードマップ

**最終更新**: 2026-05-04  
**現状**: Kick ライブステータス対応・12メンバー登録済み・本番稼働中

---

## 現在の実装状況

| 機能 | 状態 | 備考 |
|------|------|------|
| Kick ライブステータス | ✅ 完了 | API v2 / Edge Runtime |
| メンバー一覧ページ | ✅ 完了 | 12名 / LIVEバッジ付き |
| 掟10条ページ | ✅ 完了 | MDXファイル外部化済み |
| About・Contact ページ | ✅ 完了 | — |
| YouTube ライブステータス | ❌ 未実装 | 後述 |
| ふわっち ライブステータス | ❌ 未実装 | 後述 |
| カスタムドメイン | ❌ 未実装 | 後述 |

---

## フェーズ1: 配信PF対応拡張（優先度：高）

### 1-1. 対応PFの優先順位と根拠

現在の `StreamingPlatform` 型には6PFが定義済みだが、`lib/live-status.ts` の `checkPlatform()` は Kick のみ実装。

```
type StreamingPlatform = "kick" | "youtube" | "twitch" | "fuwacchi" | "niconico" | "twitcasting"
```

| PF | API公開状況 | 認証要否 | 実装難易度 | 推奨優先度 |
|----|-----------|---------|-----------|----------|
| **YouTube Live** | ✅ 公式API | 要APIキー（無料） | 中 | 🔴 最高（メンバーの主配信PF） |
| **TwitCasting** | ✅ 公式API | 要APIキー（無料） | 低〜中 | 🟡 中（利用メンバー確認後） |
| **ふわっち** | ⚠️ 非公式のみ | 不要（スクレイピング） | 高 | 🟡 中（利用メンバー多い） |
| **ニコニコ生放送** | ⚠️ 制限あり | 要ログイン | 高 | 🟠 低（安定性に課題） |
| **Twitch** | ✅ 公式API | 要APIキー | 低 | 🟠 低（国内での利用少ない） |

### 1-2. YouTube Live 実装方針

**環境変数追加（.env.local）**:
```
YOUTUBE_API_KEY=<YouTube Data API v3 キー>
```

**実装箇所**: `lib/live-status.ts` の `checkPlatform()` に追加
```typescript
case "youtube":
  return checkYouTube(handle);
```

**APIエンドポイント**:
```
GET https://www.googleapis.com/youtube/v3/search
  ?part=snippet
  &channelId={channelId}
  &eventType=live
  &type=video
  &key={YOUTUBE_API_KEY}
```

**注意点**:
- YouTube Data API v3 は1日10,000ユニットの無料枠あり
- `search.list` は100ユニット消費 → 12メンバー × 複数回アクセスで枯渇リスクあり
- 対策: `members.ts` に `channelId` フィールドを追加（チャンネルIDで直接検索）

### 1-3. ふわっちライブステータス実装方針

公式APIが存在しないため、スクレイピングまたは非公式APIを利用。

**選択肢**:
- A案: `https://whowatch.tv/profile/t:{username}` をフェッチしてHTMLをパース
- B案: ふわっちのウェブソケット（不安定・仕様変更リスク高）

**推奨**: A案で実装し、失敗時は `isLive: false` を返す安全設計  
【要確認】スクレイピングの利用規約上の問題を確認すること

---

## ✅ フェーズ2: アバター画像のローカル統一（完了: 2026-05-04）

### 実施内容

| 対象メンバー | 旧パス | 新パス |
|-----------|-------|-------|
| 全一（zenitu_desu） | `/members/zenichi.jpg`（800×1200） | `/avatars/zenitu_desu.png`（512×512） |
| えるぴ（erupi1022） | `/members/erupi.png`（673×833） | `/avatars/erupi1022.png`（512×512） |
| おださや（sayachioda） | `/members/oda-saya.jpg`（960×1706） | `/avatars/sayachioda.png`（512×512） |
| エセアカにゃん（eseakanyan0928） | `https://unavatar.io/...` | `/avatars/eseakanyan0928.png`（512×512） |

### 効果（実測値）

| 指標 | Before | After |
|-----|--------|-------|
| 画像平均サイズ | 約 1,200 KB（非正方形） | 約 370 KB（512×512 正方形） |
| WebP 対応ファイル数 | 0 | 4 ペア（各 26〜40 KB） |
| 外部画像依存（4名分） | unavatar.io 依存あり | 0（完全ローカル化） |
| 外部画像依存（残り8名） | unavatar.io 8名 | 変更なし（本人確認待ち） |

### その他の変更

- `schema.json` の slug パターンを `^[a-z0-9_-]+$` に拡張（アンダースコア許可）
- `public/members/` ディレクトリを廃止（git 履歴でのみ参照可能）
- ドキュメント類（OPERATIONS.md / schema.json / README.md）の旧パス記述を全更新

### 今後の運用

新規メンバー追加時は `public/avatars/{kick_username}.png` + `.webp` を配置し、  
`public/avatars/README.md` の手順に従うこと。

---

## フェーズ3: カスタムドメイン化（優先度：中）

### 判断基準

以下を満たしたタイミングで移行を検討：
- メンバー数が20名を超えた
- 月間アクセス数が1,000PVを超えた
- サイトが裏キック団の「公式」として広く認知された

### 候補ドメイン

| ドメイン | 想定年額 | 取得可能性 |
|---------|---------|-----------|
| `urakick.com` | ¥1,500〜¥3,000 | 要調査 |
| `urakick.jp` | ¥3,000〜¥5,000 | 要調査 |
| `urakickdan.com` | ¥1,500〜¥3,000 | 要調査 |

### 手順

1. Vercel ダッシュボード → プロジェクト → Settings → Domains
2. カスタムドメインを追加
3. DNS設定（ドメイン管理画面でCNAMEレコードを追加）
4. SSL証明書は Vercel が自動発行

---

## フェーズ3: メンバープロフィール拡張（優先度：低）

### アイデアプール

現状のメンバーカードは最小限の情報のみ。将来的に以下を追加できる：

| 機能 | 必要な変更 | 工数目安 |
|------|-----------|---------|
| 詳細プロフィールページ `members/[slug]` | App Routerの動的ルート追加 | 中（1〜2日） |
| 配信スケジュール表示 | メンバーデータにschedule配列追加 | 中（1〜2日） |
| SNS複数対応（Instagram/TikTok） | `SocialPlatform` 型に追加 | 低（半日） |
| メンバー紹介動画埋め込み | members.tsにvideoUrl追加 | 低（半日） |
| マルチPF配信対応（Kick + ふわっち同時） | live-status.tsの並列チェック実装済みのため設定のみ | 低（1〜2時間） |

---

## フェーズ4: コミュニティ機能（優先度：最低・アイデアプール）

以下は実装工数が大きく、現時点では着手不要。メンバーの需要が高まった際に検討：

- **配信アーカイブ統合**: YouTube/Kick のアーカイブ一覧
- **イベントカレンダー**: バースデーレイドパス予定の表示
- **コメント・応援機能**: リアルタイムチャット（Supabase等の外部サービス利用前提）
- **ファングッズ販売ページ**: 外部ECへの誘導

---

## 法人化フェーズとの連動

TagTech（えるぴが管理する個人事業）が法人化するタイミングで以下を検討：

- サイトの著作権表記の更新（「TagTech」から「株式会社TagTech」へ）
- ホスティング費用の法人経費化
- 独自ドメイン取得費用の法人経費化
- Google Analytics 4 の法人アカウントへの統合

---

## 意思決定ログ

| 日付 | 決定内容 | 判断者 |
|------|---------|--------|
| 2026-04-29 | Next.js 16 + Vercel でサイト構築 | えるぴ |
| 2026-05-04 | 掟10条をMDXファイルに外部化 | えるぴ |
| 2026-05-04 | アバター画像ローカル統一完了（4名 `/avatars/` 移行・`public/members/` 廃止・全画像 512×512 WebP対応） | えるぴ |

---

*最終更新: 2026-05-04（アバターローカル化フェーズ追加） / 管理: えるぴ*
