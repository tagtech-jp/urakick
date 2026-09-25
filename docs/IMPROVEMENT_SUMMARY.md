# IMPROVEMENT_SUMMARY — 改善タスク完了レポート

**実施日**: 2026-05-04  
**実施者**: えるぴ（Claude Code サポート）

---

## 変更ファイル全リスト

### タスクA: 掟10条 MDX外部化

| 変更種別 | ファイル | 内容 |
|---------|---------|------|
| **新規作成** | `content/rules/oki-10.mdx` | 掟10条をYAML frontmatter + Markdown bodyで外部化 |
| **新規作成** | `lib/rules.ts` | gray-matterローダー。型定義: Rule / RuleFrontmatter / RuleData |
| **新規作成** | `content/rules/README.md` | 非エンジニア向け編集ガイド（GitHub web editor手順） |
| **変更** | `app/rules/page.tsx` | TSハードコードを削除 → `getRules()` 経由に変更 |
| **変更** | `package.json` | `gray-matter: ^4.0.3` を dependencies に追加 |

#### 削除・置換した既存コード

`app/rules/page.tsx` から削除:
```typescript
// 削除: RULES配列（TSに直書きされていた10条）
const RULES: string[] = [
  "メンバー同士で揉めないこと。",
  // ...計10件
];

// 削除: ハードコードされた罰則説明文
<p>ルールを破った者は裏キック団で話し合いを行い...</p>
```

追加:
```typescript
import { getRules } from "@/lib/rules";
// getRules() でMDXファイルから動的取得
```

### タスクB: 不足文書3本生成

| 変更種別 | ファイル | 内容 |
|---------|---------|------|
| **新規作成** | `docs/OPERATIONS.md` | 運用マニュアル（メンバー追加・掟改定・ロールバック手順） |
| **新規作成** | `docs/ROADMAP.md` | 開発ロードマップ（PF拡張優先順位・カスタムドメイン判断基準） |
| **新規作成** | `docs/ARCHITECTURE.md` | システム設計書（データフロー・MDX設計・PF拡張手順） |

---

## 動作確認結果

### ビルド確認

```
✓ Compiled successfully in 26.9s
✓ Running TypeScript in 3.7s ... (エラーなし)
✓ Generating static pages (9/9)
```

### ページ一覧（ビルド後）

| ページ | 種別 | 状態 |
|--------|------|------|
| `/` | Static | ✅ |
| `/about` | Static | ✅ |
| `/rules` | Static | ✅（MDXから静的生成） |
| `/members` | Static | ✅ |
| `/contact` | Static | ✅ |
| `/api/live-status` | Edge Dynamic | ✅ |

**変更前後の差異**: `/rules` ページは MDX ファイルをビルド時に読み込んで Static HTML を生成。掟の変更は次回デプロイ時に反映される。

---

## 【要確認】タグ集計

| ファイル | 要確認数 | 内容 |
|---------|---------|------|
| `docs/ARCHITECTURE.md` | 0 | — |
| `docs/OPERATIONS.md` | 0 | — |
| `docs/ROADMAP.md` | 1 | ふわっちスクレイピングの利用規約確認 |
| 合計 | **1** | — |

---

## 次のアクション

### 即対応すべき項目

1. **開発サーバーで動作確認** — ビルド成功を確認済みだが、実際の表示をブラウザで目視確認する
   ```bash
   cd D:\urakick && npm run dev
   # http://localhost:3000/rules を開いてルール一覧が正常表示されるか確認
   ```

2. **GitHubへpush** — 変更を本番に反映させる
   ```bash
   git add content/rules/ lib/rules.ts app/rules/page.tsx docs/ package.json package-lock.json
   git commit -m "feat: 掟10条をMDXファイルに外部化・運用文書3本追加"
   git push origin main
   ```

3. **Vercelデプロイ確認** — push後5〜10分で https://urakick.vercel.app/rules を確認

### 1週間以内に検討すべき項目

4. **YouTube Liveステータス対応** — `ROADMAP.md` に設計方針を記載済み。YouTube Data API v3 のキーを取得してから実装（1〜2日の工数）

5. **ふわっちライブステータス対応** — スクレイピングの利用規約確認後に実装方針決定

### 後回し可能な改善項目

6. **カスタムドメイン取得** — `ROADMAP.md` の判断基準（月間1,000PV超）を満たしてから

7. **メンバープロフィール詳細ページ** — `members/[slug]` の動的ルート追加。現在は優先度低

---

## リスク・懸念事項

| リスク | 重大度 | 対策 |
|--------|--------|------|
| `oki-10.mdx` の YAML が壊れるとビルドエラー | 中 | `content/rules/README.md` の注意事項を参照 |
| Kick API v2 の仕様変更 | 中 | `lib/live-status.ts` の `checkKick()` を修正 |
| gray-matter の脆弱性 | 低 | `npm audit` で定期確認（現在1件の低〜中程度の警告あり） |

---

*2026-05-04 / 全タスク完了*
