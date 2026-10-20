# 部署说明

本站是**纯静态导出**（`next.config.js` 中 `output: 'export'`，产物目录 `dist/`），
唯一部署链路是：

```
git push origin main
  → GitHub Actions（pnpm install / pnpm build）
  → appleboy/scp-action 上传 dist/ 内容
  → 阿里云 ECS：/var/www/aiblogs/
```

工作流定义：[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

## 前置条件

仓库 Secrets 需要配置：

| Secret | 说明 |
|---|---|
| `SERVER_HOST` | 服务器 IP / 域名 |
| `SERVER_USER` | SSH 用户名 |
| `SERVER_PASSWORD` | SSH 密码 |

## 构建产物

- `dist/`：HTML、`_next/` 静态资源、`images/`、`robots.txt`
- `dist/sitemap.xml`、`dist/feed.xml`：由 `scripts/generate-seo.js` 在 `next build` 后生成

## 服务器侧（Nginx）

把 `/var/www/aiblogs` 作为静态站点根目录。由于是静态导出，目录中是
`daily.html`、`blog/xxx.html` 这类文件，`/daily` 需要重写到 `daily.html`：

```nginx
server {
    listen 80;
    server_name mind-keeper.com;
    root /var/www/aiblogs;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }
}
```

## 本地验证

```bash
pnpm install
pnpm build          # 生成 dist/ 与 sitemap/feed
npx serve dist      # 本地预览静态产物
```

> 旧的 PM2 / `next start` 部署方式（`deploy.sh`、`ecosystem.config.js`）已移除：
> 静态导出无法用 `next start` 运行，请勿再使用。
