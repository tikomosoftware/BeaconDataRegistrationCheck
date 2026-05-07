# Design Rules - Common Preferences

このファイルは、検証用ダッシュボード・実運用Webアプリ・演出系Webアプリのすべてに共通して適用する個人ルールです。個別のデザインルールよりも上位の方針として扱います。

## Core Preferences

- 余白はやや広めに取る
- 角丸は小さすぎず、6pxから12px程度を基本にする
- 原色は使わない
- 影は弱めにし、主にパネルの分離にだけ使う

---

## Current App Measurements

Beacon Data Registration Check の現行UIでは、以下の値を実際の基準として使っている。

### Radius

```css
/* Panels and notice boxes */
border-radius: 8px;

/* Inputs, buttons, table wrappers, code previews */
border-radius: 6px;
```

Current usage:

- `.panel`: `8px`
- `.noticeBox`: `8px`
- `.topNav a`: `6px`
- `input`, `textarea`: `6px`
- `.inlineControl button`, `.submitButton`: `6px`
- `.refreshButton`: `6px`
- `.tableWrap`: `6px`
- `pre`: `6px`

Interpretation:

- 今のアプリは、丸みを出しつつも検証ツールらしい締まりを残している。
- さらにやわらかくしたい場合は、controlsを `8px`、panelsを `12px` に上げる。
- 現行デザインを維持する場合は、`6px / 8px` の2段階を基本にする。

### Shadow

```css
--shadow: 0 18px 60px rgba(25, 34, 31, 0.12);
```

Current usage:

- `.panel` にのみ `box-shadow: var(--shadow)` を適用
- Inputs, buttons, table wrappers, notice boxesには通常の影を付けない
- Focus stateだけ、入力補助として薄いリング影を使う

```css
input:focus,
textarea:focus {
  box-shadow: 0 0 0 3px rgba(12, 124, 104, 0.14);
}
```

Interpretation:

- 影は存在するが、装飾ではなくパネル分離のために使っている。
- より弱めたい場合は `rgba(..., 0.08)` から `0.10` 程度に下げる。
- 業務ツール寄りにする場合は、影を外してborder中心にしてもよい。

### Spacing

```css
.shell {
  padding: 40px 20px;
}

.contentGrid {
  gap: 20px;
}

.formPanel,
.resultPanel,
.recordsPanel {
  padding: 22px;
}
```

Current usage:

- Page padding: desktop `40px 20px`, mobile `28px 14px`
- Workspace width: `min(1080px, 100%)`
- Heading bottom margin: `24px`
- Notice bottom margin: `16px`
- Notice padding: `10px 12px`
- Main grid gap: `20px`
- Panel padding: `22px`
- Form field gap: `16px`
- Inline control gap: `8px`
- Field row gap: `12px`
- Result panel gap: `22px`
- Table cell padding: `11px 12px`

Interpretation:

- 全体の余白はやや広めだが、検証画面として一画面に収まる密度も残している。
- 実運用Webアプリでは、section spacingをもう少し広げてもよい。
- ダッシュボードやログ画面では、table cell paddingだけ少し詰めてもよい。

---

## Spacing

画面全体は詰め込みすぎず、入力・読解・確認の呼吸ができる余白を残す。

- ページ外周の余白は広めにする
- セクション間には明確な間隔を作る
- フォーム項目は密着させない
- テーブルやログなど情報量が多い場所だけ、必要に応じて密度を上げる

目安:

```css
--space-xs: 6px;
--space-sm: 10px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 40px;
```

---

## Radius

角丸は少し大きめにして、硬い管理画面になりすぎないようにする。ただし、過度に丸い装飾的なUIにはしない。

目安:

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
```

Use:

- Inputs and small buttons: `--radius-sm`
- Panels and notice boxes: `--radius-md`
- Large media or feature sections: `--radius-lg`

Avoid:

- Pill型の多用
- 角丸が大きすぎて子どもっぽく見えるUI
- 同一画面内で角丸サイズがばらつくこと

---

## Color

原色や高彩度色は使わない。色は少し濁らせた、落ち着いたトーンを基準にする。

Rules:

- Pure red, blue, green, yellow such as `#ff0000`, `#0000ff`, `#00ff00`, `#ffff00` are not allowed
- Accent colors should be slightly muted
- Background colors should be near-white or low-saturation darks
- Warning colors should be readable but not fluorescent
- Success and danger colors should be recognizable, but not alarm-like unless the state is critical

Good direction:

```css
--accent-green: #0c7c68;
--accent-blue: #256fba;
--accent-gray: #4f6675;
--warning-bg: #fff4bf;
--danger: #a33b3b;
```

---

## Shadow

影は弱めにして、面の分離を助ける程度に使う。強い浮遊感や派手なカード感は避ける。

目安:

```css
--shadow-sm: 0 8px 24px rgba(25, 34, 31, 0.08);
--shadow-md: 0 18px 52px rgba(25, 34, 31, 0.10);
```

Rules:

- Shadow opacity is usually `0.08` to `0.12`
- Avoid multiple layered shadows
- Do not use shadows as the only separator; keep borders where structure matters
- Dense tools and dashboards should prefer borders over strong shadows

---

## How To Apply

When creating or updating a more specific design rule, include a short inheritance note near the top:

```md
This rule extends ./design-rule-common.md.
If there is a conflict, follow the specific product rule only when the reason is explicit.
```

When asking an AI agent or developer to apply these preferences, use:

```text
spec/design-rule-common.md を共通ルールとして読んだうえで、対象のデザインルールを適用してください。
余白は広め、角丸は大きめ、原色は禁止、影は弱めにしてください。
```
