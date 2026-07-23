# 蛋蛋文案（dandan-caption）

上传图片或短视频，使用你自己的**火山方舟 Ark API Key（BYOK）**，一键生成小红书 / 抖音 / 朋友圈三套文案。

## 本地开发

```bash
cd dandan-caption
npm install
npm run dev:api   # http://127.0.0.1:8791/api/caption-gen
npm run dev       # http://localhost:5173/caption/
```

浏览器打开后先「配置 Key」，模型填你在方舟控制台创建的**视觉理解接入点 ID**。

本地可用 `apiKey=mock`（在设置里填 `mock`）跳过真实调用，返回示例文案。

## 环境变量

见 `.env.example`。生产环境默认完全 BYOK，无需配置服务端 Key。

## 部署

- Vite `base: '/caption/'`
- Netlify：`/api/caption-gen` → Function；`/caption/*` rewrite
- 在 dandanhub 通过反向代理挂载 `/caption/`

## 技术要点

- 图片客户端压缩后以 data URL 提交
- 视频在浏览器抽 6–8 张关键帧（避免整段视频打进 Function）
- 后端代理 `ark.cn-beijing.volces.com/api/v3/chat/completions`
