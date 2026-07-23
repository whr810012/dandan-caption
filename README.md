# 蛋蛋文案（dandan-caption）

上传图片或短视频，使用你自己的**火山方舟 Ark API Key（BYOK）**，一键生成小红书 / 抖音 / 朋友圈三套文案。

## 本地开发

```bash
cd dandan-caption
npm install
npm run dev:api   # http://127.0.0.1:8791/api/caption-gen
npm run dev       # http://localhost:5173/caption/
```

浏览器打开后先「配置 Key」：
- **Ark API Key**：填 Secret（密钥），不是 Key ID
- **模型**：填官方完整 Model ID `doubao-seed-2-1-pro-260628`（不要省略 `-260628`），或自建接入点 `ep-…`
- 调用方式对齐官方 Chat Completions：`/api/v3/chat/completions` + `image_url` 多模态 content
- 参考：[方舟调用文档](https://console.volcengine.com/ark/region:cn-beijing/docs/82379/1399008?lang=zh)

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
