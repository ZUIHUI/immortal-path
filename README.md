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
OPENAI_NOVEL_MODEL=gpt-5.5
OPENAI_NOVEL_QUICK_MODEL=gpt-5.4-mini
OPENAI_NOVEL_FALLBACK_MODEL=gpt-4.1
OPENAI_NOVEL_REASONING_EFFORT=low
```

`OPENAI_NOVEL_MODEL` 用於主線小說生成；`OPENAI_NOVEL_FALLBACK_MODEL` 會在主模型尚未開通、模型名稱錯誤或參數不支援時自動接手。小說 route 不設定人工 `max_output_tokens` 上限，避免長段小說 JSON 被截斷；`OPENAI_NOVEL_REASONING_EFFORT=low` 可降低延遲。API 模型 ID 請使用 `gpt-5.5` 這類 slug，不要填 ChatGPT 介面名稱如 `gpt-5.5-thinking`。程式會把常見舊填法自動正規化，但 Vercel 建議直接填正確 slug。

## 驗證

```bash
npm test
npm run build
```
