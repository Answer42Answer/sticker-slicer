# ✂️ 表情包切图小工具

> 一款简洁高效的在线表情包切割工具，纯浏览器运行，无需上传服务器，保护你的隐私。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Web-brightgreen.svg)
![No Server](https://img.shields.io/badge/server-none-orange.svg)

## ✨ 功能特性

- 🖼️ **拖拽上传** - 支持拖拽或点击上传 PNG、JPG、GIF 图片
- 📐 **自定义网格** - 自由设置行列数，快速均分图片
- 🎯 **精准微调** - 拖拽网格线进行像素级精确对齐
- ✅ **批量选择** - 点击选择需要的切片，支持部分下载
- 📦 **一键打包** - 所有切片自动打包为 ZIP 下载
- 🔒 **隐私安全** - 纯前端运行，图片不会上传到任何服务器

## 🚀 快速开始

### 在线使用

👉 **直接访问**: [https://answer42answer.github.io/sticker-slicer/](https://answer42answer.github.io/sticker-slicer/)

无需下载，打开即用！手机扫码也能用 👇

<p align="center">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://answer42answer.github.io/sticker-slicer/" alt="扫码访问" width="200">
  <br>
  <sub>📱 扫码立即体验</sub>
</p>

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/Answer42Answer/sticker-slicer.git

# 进入目录
cd sticker-slicer

# 直接用浏览器打开
open index.html  # macOS
# 或
start index.html # Windows
```

## 📖 使用说明

1. **上传图片** - 点击上传区域或直接拖拽图片到页面
2. **设置网格** - 输入需要切割的行数和列数
3. **微调对齐** - 拖拽紫色网格线，使其精确对齐表情包边界
4. **开始切割** - 点击「⚡️ 开始切割」按钮
5. **选择下载** - 点击选择需要的切片，或直接下载全部

## 🛠️ 技术栈

- **前端框架**: 纯原生 JavaScript（零依赖）
- **样式**: 原生 CSS（暗色主题）
- **打包**: [JSZip](https://stuk.github.io/jszip/) - 客户端 ZIP 生成
- **下载**: [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - 文件下载

## 📁 项目结构

```
sticker-slicer/
├── index.html      # 主页面
├── script.js       # 核心逻辑
├── lib/
│   ├── jszip.min.js      # ZIP 打包库
│   └── FileSaver.min.js  # 文件保存库
└── README.md
```

## 🤝 支持作者

如果这个小工具对你有帮助，愿意成为我的**「创始粉丝」**吗？🌟

关注、点赞、收藏、转发，你的每一份支持都是我持续创作的动力！

| 平台 | 账号 | ID |
|:---:|:---:|:---:|
| 🎵 抖音 | **答案42** | 35542199873 |
| 📕 小红书 | **答案42** | 27422552916 |
| 💬 视频号 | **答案の42** | sph2zLiOMpNNeim |
| 📺 Bilibili | **答案_42** | 3632318019275083 |

---

<p align="center">
  Made with ❤️ by <strong>答案42</strong>
  <br>
  更多 AI 玩法持续更新中...
</p>

