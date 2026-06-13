# sugaku-club.com — AI-Resistant CAPTCHA & Math Problem API

## 概要

AIに突破されにくいCAPTCHAシステムと数学問題APIです。
**依存ゼロ（Vanilla JSのみ）** で構築。
現代AI（GPT-4+、Gemini、Claude）に対して行動解析＋判断型問題で対抗します。

## デモ

- Landing Page: index.html
- CAPTCHA Demo: captcha.html
- API Docs: docs.html

---

## 機能

### CAPTCHAシステム
- 手作り20問（物理直感・皮肉理解・倫理的判断）
- 自動生成9,980問（50テンプレート × ランダムパラメータ）= 合計10,000問
- BotDetector Engine v3（リアルタイム行動解析）
  - navigator.webdriver検出
  - マウス軌跡エントロピー解析
  - 回答速度解析（800ms未満 = 疑わしい）
  - Headlessブラウザ検出

### 数学問題API
- 難易度1〜5（中学基礎〜大学受験難関）
- LaTeX形式の問題・解答
- カテゴリ：代数・微積分・幾何・統計・数論

---

## ファイル構成

```
sugaku-captcha/
├── index.html          # ランディングページ
├── captcha.html        # CAPTCHAウィジェット
├── bank_generator.js   # 10K問バンク生成エンジン
├── signup.html         # 登録・決済フロー
├── docs.html           # APIドキュメント
├── success.html        # 決済完了ページ
├── terms.html          # 利用規約
└── privacy.html        # プライバシーポリシー
```

---

## 技術スタック

| 層 | 技術 |
|---|---|
| フロントエンド | Vanilla HTML/CSS/JavaScript |
| フォント | Google Fonts (Outfit + Noto Sans JP) |
| セキュリティ | Cloudflare |
| ホスティング | さくらVPS（予定） |
| バックエンド | PHP + SQLite（予定） |

**npm不要・フレームワーク不要・ビルドステップなし**

---

## BotDetectorのシグナル

```javascript
// リアルタイムbotスコア（0=人間, 100=Bot）
{
  webdriver:   false,  // Selenium/Playwright検出
  headlessUA:  false,  // HeadlessChrome UA検出
  noPlugins:   false,  // プラグイン0件
  mouseTraj:   0.73,   // 軌跡エントロピー（0.15未満=直線的=Bot）
  answerSpeed: 3200,   // 平均回答時間ms（800未満=疑わしい）
}
// → Bot Score: 3%（人間）
```

---

## ロードマップ

- [x] ランディングページ（料金プラン付き）
- [x] CAPTCHAウィジェット（手作り20問）
- [x] 10K問バンクジェネレーター
- [x] BotDetector Engine v3
- [x] APIドキュメント
- [x] セキュリティアーキテクチャ設計
- [ ] さくらVPSデプロイ
- [ ] PHP APIゲートウェイ
- [ ] Stripe/PayPal Webhook連携
- [ ] メール認証フロー
- [ ] 使用量ダッシュボード

---

## なぜ作ったか

現代のAI（GPT-4+、Gemini 2.0、Claude 3.7）はテキストベースのCAPTCHAをほぼ突破できます。
このプロジェクトは以下を通じてAI耐性設計の限界を探ります：

1. 行動解析（正解するだけでは突破できない）
2. 人間的経験を要する判断型問題
3. 多層防衛（クライアント行動解析＋サーバー側検証）

---

## 作者

個人開発（学生）
🌐 sugaku-club.com
📧 contact@sugaku-club.com
