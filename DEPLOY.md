# GitHub Pages 与自定义域名

目标仓库：`JiYeXingZou/wangdao-network-lab`（Public）。目标域名：`408.sagiri.top`。

1. 创建公开仓库，上传本目录源码，默认分支为 `main`。
2. Settings → Pages → Source 选择 GitHub Actions。
3. 运行 Actions 中的 Deploy network lab，或向 main 推送一次更新。工作流先校验，再打包静态网页。
4. Settings → Pages → Custom domain 填入 `408.sagiri.top` 并保存。Actions 发布模式下仅添加仓库 CNAME 文件不能替代这项设置。
5. 在阿里云 sagiri.top 的 DNS 中添加以下记录，先检查是否已有同名记录；不改动根域与其他子域。

| 主机记录 | 类型 | 记录值 |
| --- | --- | --- |
| 408 | CNAME | JiYeXingZou.github.io |

6. 等待 DNS 检查与证书签发，再启用 Enforce HTTPS。
7. 访问确认底图加载、11 个场景、70 步、播放与字段视图正常，再发布宣传文案。

官方说明：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

计划域名与仓库名称不代表已经上线。
