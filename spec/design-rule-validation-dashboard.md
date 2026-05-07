# Design Rules - Beacon Data Registration Check

This rule extends ./design-rule-common.md.
If there is a conflict, follow this validation dashboard rule only when the reason is explicit.

## Theme

このWebアプリは、Supabaseへのデータ登録と登録結果の確認を行うための技術検証用ツールです。見た目は派手なプロダクトサイトではなく、落ち着いて入力・確認・比較ができる小さな検証ダッシュボードとして扱います。

- 淡い背景と白い作業パネルで、画面全体を軽く見せる
- デフォルトはグリーン系アクセントで、Supabaseらしい接続・成功・確認の印象を出す
- かわいい丸みのある日本語フォントを優先し、硬すぎる業務画面にしない
- ただし情報密度は落としすぎず、フォーム・レスポンス・登録済みデータを一画面で確認できるようにする
- 注意文は黄色背景で見つけやすくするが、主役にしすぎない
- 装飾よりも、入力しやすさ・読みやすさ・テーブルの確認しやすさを優先する

---

## Color Tokens

現行UIは Green テーマを基準にする。検証用の派生テーマとして Blue と Gray も定義しておく。

### Green Theme - Default

Supabase接続、登録成功、ライフチェックなど、「データが正しく流れている」印象を出したいときの標準テーマ。

```css
:root {
  --background: #f6f7f2;
  --surface: #ffffff;
  --surface-soft: #eef4f3;
  --text: #17201d;
  --muted: #68736e;
  --line: #d9dfdb;
  --accent: #0c7c68;
  --accent-dark: #075746;
  --danger: #a33b3b;
  --success: #0a6f45;
  --warning-bg: #fff4bf;
  --warning-border: #e4b740;
  --warning-text: #3f3100;
  --shadow: 0 18px 60px rgba(25, 34, 31, 0.12);
}
```

Use Green when:

- Supabaseや登録成功の文脈を自然に見せたい
- 個人検証用のやわらかさを残したい
- 「動作確認できている」安心感を出したい

### Blue Theme - Technical Verification

API検証、開発者向けツール、疎通確認など、より技術検証らしさを強めたいときのテーマ。

```css
:root {
  --background: #f5f8fb;
  --surface: #ffffff;
  --surface-soft: #edf4fa;
  --text: #16202a;
  --muted: #647382;
  --line: #d5e0ea;
  --accent: #256fba;
  --accent-dark: #174d82;
  --danger: #a33b3b;
  --success: #16724c;
  --warning-bg: #fff4bf;
  --warning-border: #e4b740;
  --warning-text: #3f3100;
  --shadow: 0 18px 60px rgba(22, 32, 42, 0.11);
}
```

Use Blue when:

- APIテスターや開発者向けツール感を強めたい
- グリーンのSupabase色を少し弱めたい
- 冷静で技術的な印象を出したい

### Gray Theme - Operational Dashboard

ログ確認、管理画面、長時間のテーブル確認など、業務ツール感と可読性を優先したいときのテーマ。

```css
:root {
  --background: #f5f6f7;
  --surface: #ffffff;
  --surface-soft: #f0f2f3;
  --text: #1d2327;
  --muted: #687077;
  --line: #d9dddf;
  --accent: #4f6675;
  --accent-dark: #354854;
  --danger: #a33b3b;
  --success: #286f4a;
  --warning-bg: #fff4bf;
  --warning-border: #e4b740;
  --warning-text: #3f3100;
  --shadow: 0 18px 52px rgba(29, 35, 39, 0.10);
}
```

Use Gray when:

- 登録結果やログの読み取りを最優先したい
- 色の主張を抑えて業務ツール寄りにしたい
- エラーや成功状態の色をより目立たせたい

### Theme Rules

- Green is the default unless there is a clear reason to switch.
- Only switch the token values; layout, spacing, typography, and component shapes should stay the same.
- Do not mix theme accent colors in one screen.
- Warning yellow should remain stable across themes because it carries operational caution.
- Success and danger colors may stay close across themes so status recognition does not change.

---

## Color Usage

- Page background: `--background` with a very soft vertical gradient using the theme accent at low opacity.
- Primary actions: `--accent`.
- Primary action hover: `--accent-dark`.
- Borders: `--line`.
- Panels and inputs: `--surface`.
- Code and table header surfaces: `--surface-soft`.
- Success status: `--success`.
- Error status: `--danger`.
- Notes and warnings: yellow background using `--warning-bg`.

---

## Typography

日本語は少し丸みのある、親しみやすいフォントを優先する。

```css
font-family:
  "Hiragino Maru Gothic ProN",
  "Yu Gothic UI",
  "Hiragino Sans",
  "Yu Gothic",
  Meiryo,
  Arial,
  sans-serif;
```

### Type Scale

- H1: `32px`, line-height `1.2`
- H2: `16px`
- Eyebrow and labels: `13px`, bold
- Body text: `13px` to `15px`
- Table text: `13px`
- Code preview: `13px`, line-height `1.55`

Avoid oversized hero typography. This is a verification tool, so headings should orient the user quickly without dominating the workspace.

---

## Layout

Use a centered workspace with a maximum width.

```css
.workspace {
  width: min(1080px, 100%);
  margin: 0 auto;
}
```

### Top Screen Structure

1. Top navigation
2. Eyebrow and page title
3. Compact yellow note
4. Main two-column work area
5. Full-width registered data table

The main work area uses two columns on desktop:

- Left: registration form
- Right: request and response preview

On mobile, all major sections stack into one column.

---

## Surfaces

Use panels only for functional areas:

- Form panel
- Request/response panel
- Registered data table panel
- About page information panels

Panel styling:

```css
border: 1px solid var(--line);
border-radius: 8px;
background: var(--surface);
box-shadow: var(--shadow);
```

Do not nest cards inside cards. If content belongs together, use spacing and section headings inside the existing panel.

---

## Notice Box

The notice box is a compact caution area, not a large announcement banner.

Use it for:

- This app is for technical verification
- The server is for personal operation checks
- The API send button writes real data

Style:

```css
border: 1px solid var(--warning-border);
border-radius: 8px;
background: var(--warning-bg);
color: var(--warning-text);
padding: 10px 12px;
font-size: 13px;
```

Keep copy short. The notice should be visible, but it should not push the form too far down.

---

## Form Controls

Inputs and textareas should feel calm and sturdy.

```css
border: 1px solid var(--line);
border-radius: 6px;
background: #ffffff;
padding: 11px 12px;
font-size: 15px;
```

Focus state:

```css
border-color: var(--accent);
box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent);
```

If `color-mix` is not desired, use an explicit low-opacity theme accent shadow.

Use native controls when they are clearer:

- Date filters: `input[type="date"]`
- Number fields: `input[type="number"]`
- Longer comments: `textarea`

---

## Buttons

Primary action buttons use the theme accent fill.

```css
background: var(--accent);
color: #ffffff;
border-radius: 6px;
font-weight: 700;
```

Secondary utility buttons, such as `Refresh` and `Clear Filters`, use white background with a border.

Disabled buttons should keep their shape and position, with lower opacity and a wait/default cursor.

---

## Tables

The registered data table is the most important verification surface. It must stay readable even with long UUID values.

Rules:

- Use horizontal scrolling instead of shrinking columns too aggressively
- Keep a minimum table width around `860px`
- Table header uses `--surface-soft`
- UUID cells use monospace and `word-break: break-all`
- Filters live inside the header cells
- Date filters use calendar controls and ignore time

Table wrapper:

```css
overflow: auto;
border: 1px solid var(--line);
border-radius: 6px;
```

---

## Status States

Use simple text states near the response or table area.

- Loading: accent-dark
- Success: success green
- Error: danger red
- Empty or inactive: muted gray

Avoid toast-only feedback. The user should be able to see the latest request, response, and table state without relying on transient UI.

---

## Copy Tone

The copy should be clear, small, and practical.

- Prefer direct labels: `Request`, `Response`, `Registered Data`
- Japanese notes should sound friendly but not overly casual
- Avoid long explanations inside the main UI
- Put setup details and operational caveats in README, not on the screen

---

## Responsive Rules

At small widths:

- Collapse the form/result grid to one column
- Collapse field rows to one column
- Keep table horizontal scrolling enabled
- Keep note text compact
- Do not reduce font size based on viewport width

---

## Things To Avoid

- Dark dashboard themes
- Large marketing hero sections
- Decorative gradients beyond the subtle page background
- Oversized warning banners
- Nested cards
- Negative letter spacing
- Tiny table text below `13px`
- Replacing native date inputs with custom calendar UI unless there is a strong reason

---

## How To Request Theme Changes

When asking an AI agent or developer to apply one of these themes, reference this file and the exact theme name.

### Simple Request

```text
spec/design-rule.md を読んで、Blue Theme - Technical Verification に沿って現在のアプリの見た目を変更してください。
```

### Recommended Request

```text
spec/design-rule.md の Blue Theme - Technical Verification を適用してください。
レイアウトや文言は変えず、色トークンだけをブルー系に差し替えてください。
変更後にビルドとブラウザ確認もお願いします。
```

### Conservative Request

```text
今のGreen Themeの雰囲気は保ちつつ、spec/design-rule.md の Blue Theme のカラートークンへ変更してください。
フォーム、テーブル、注釈の構造は変えないでください。
```

### Gray Theme Request

```text
spec/design-rule.md の Gray Theme - Operational Dashboard を適用してください。
管理画面らしい落ち着いた印象にしたいので、色トークンだけをGray Themeに変更してください。
レイアウト、文言、フォーム項目、テーブル列は変更しないでください。
```

### Implementation Scope

Theme changes should usually be limited to:

- `src/app/styles.css` の `:root` color tokens
- Accent gradient opacity or color, if needed
- Focus ring color, if it uses a hard-coded accent color
- Any hard-coded warning colors that should be replaced with warning tokens

Theme changes should not alter:

- React component structure
- API behavior
- Table columns
- Form fields
- Copy text
- Spacing scale
- Border radius scale
- Responsive layout

If a requested theme change needs more than color tokens, explain why before changing layout or component structure.
