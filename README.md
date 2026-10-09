# 王道计网骚图 · 交互式协议动画

把静态网络拓扑变成可逐步播放、查看报文封装的网页，帮助复习 408 计算机网络。

## 功能

- **11 个场景、70 个步骤**：DHCP、ARP、跨网段转发、NAT、DNS、TCP/HTTP、IP 分片、逐层封装、CSMA/CA 等。
- 以王道无笔记骚图为底图，叠加发送、广播和响应路径；支持缩放与跟随步骤。
- 单步前进/回退、自动播放、调速、章节搜索和步骤链接分享。
- 有报文的步骤显示分层结构与字段；查表、等待、状态变化等步骤不显示报文解剖图。
- 支持移动端和离线单文件使用；可导入自己的笔记图片，图片仅在当前浏览器读取。
- 零运行时依赖，GitHub Actions 自动校验并部署。

## 使用

在线体验：[408.sagiri.top](https://408.sagiri.top/)，已启用 HTTPS。

离线使用：下载仓库中的 `preview.html`，直接用浏览器打开。

本地运行：

```bash
python3 -m http.server 8000
```

打开 http://localhost:8000/ 。

## 开发与部署

需要 Node.js 22 与 Python 3，无需安装 npm 依赖。

```bash
npm run check  # JS 语法检查与协议模型测试
npm run build  # 重新生成离线版 preview.html
```

| 文件 | 用途 |
| --- | --- |
| `index.html` | 在线入口 |
| `preview.html` | 离线单文件版 |
| `src/app.js` | 交互、动画与拓扑渲染 |
| `src/data.js` | 场景与步骤 |
| `src/packet.js` | 报文模型 |
| `src/styles.css` | 样式与响应式布局 |
| `tests/packet.test.js` | 协议模型与边界校验 |
| `.github/workflows/pages.yml` | 校验、构建并发布 GitHub Pages |

main 分支更新会自动部署；部署说明见 [DEPLOY.md](DEPLOY.md)。

## 贡献与教学说明

这是教学演示，包含简化假设，不是真实抓包或完整网络仿真器。未确定的报文字段不会编造。欢迎通过 Issue 提交协议错误、路径定位问题与改进建议；修改报文模型请补充相应测试。

后续计划：完善逐跳重封装和 NAT 字段变化，增加 TCP 选项、802.11 地址字段与真题填空练习。

## 许可与来源

自编程序代码以 [MIT](LICENSE) 开源。王道底图及相关第三方教学素材不包含在 MIT 授权范围内，权利归各自权利人所有；离线文件中的嵌入图片遵循同一边界。项目为个人学习可视化工具，与王道官方无隶属关系。来源说明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
