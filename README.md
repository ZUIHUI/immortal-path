# 萬世歧路

React + TypeScript + Vite + Zustand 的「AI 跨世界輪迴互動小說」MVP。

玩家只需要開始輪迴與在小說抉擇點做選擇；修為、境界、死亡、世界遺物與輪迴結算都在底層自動運作。

## 本機開發

前端畫面可以用 Vite 啟動：

```bash
npm run dev
```

但 Vite 只會跑前端，不能單獨測 Vercel API routes。要測 `/api/narrative/start`、`/api/narrative/continue`、`/api/narrative/settlement`，請使用 Vercel CLI：

```bash
vercel dev
```

## OpenAI API Key

不要把 OpenAI key 放在前端、`VITE_` 變數、localStorage 或 Git repository。

本機請建立 `.env.local`：

```bash
OPENAI_API_KEY=你的_key
```

Vercel 部署時，請到 Project Settings -> Environment Variables 新增：

```bash
OPENAI_API_KEY=你的_key
```

可選：

```bash
OPENAI_NOVEL_MODEL=gpt-5.5-thinking
OPENAI_NOVEL_QUICK_MODEL=gpt-5.5-instant
```

`OPENAI_NOVEL_MODEL` 用於主線小說生成；`OPENAI_NOVEL_QUICK_MODEL` 只在新奇度不足需要低成本重試時使用。若你的帳號或區域尚未支援這些模型，可用 `OPENAI_MODEL` 覆寫成目前可用模型。

## 驗證

```bash
npm test
npm run build
```
