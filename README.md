# epay-payment

一个基于 React + TypeScript 的支付集成解决方案，支持多种支付方式和支付流程。

## 特性

- ✨ 支持页面跳转和 API 接口两种支付方式
- 🔒 完整的签名验证和参数处理
- 🌐 内置 Node.js 代理服务器处理跨域
- 🎨 现代化的 UI 界面
- ⚡️ 基于 Vite 的快速开发体验
- 📦 TypeScript 支持

## 快速开始

1. 克隆项目
```bash
git clone https://github.com/6Kmfi6HP/epay-payment.git
cd epay-payment
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
```
编辑 `.env` 文件，填入你的配置：
```
VITE_MERCHANT_ID=your_merchant_id
VITE_MERCHANT_KEY=your_merchant_key
VITE_API_URL=https://pay.example.com
```

4. 启动开发服务器
```bash
npm run dev:all
```

## 支付方式

### 页面跳转支付
用户将被重定向到支付页面完成支付。

### API 接口支付
通过 API 获取支付二维码或支付链接。

## 项目结构

```
├── src/
│   ├── App.tsx            # 主应用组件
│   ├── utils/
│   │   └── payment.ts     # 支付相关工具函数
├── server/
│   └── index.js           # 代理服务器
├── .env.example           # 环境变量示例
└── package.json
```

## 环境变量

| 变量名 | 描述 | 必填 |
|--------|------|------|
| VITE_MERCHANT_ID | 商户 ID | 是 |
| VITE_MERCHANT_KEY | 商户密钥 | 是 |
| VITE_API_URL | API 接口地址 | 是 |
| PORT | 代理服务器端口 | 否 |

## API 参数

### 基础参数

- `pid`: 商户 ID
- `type`: 支付方式（如：alipay）
- `out_trade_no`: 商户订单号
- `notify_url`: 异步通知地址
- `return_url`: 同步跳转地址
- `name`: 商品名称
- `money`: 支付金额
- `sign`: 签名
- `sign_type`: 签名方式

### API 支付额外参数

- `clientip`: 客户端 IP
- `device`: 设备类型（pc/mobile/qq/wechat/alipay）

## 开发

```bash
# 启动前端开发服务器
npm run dev

# 启动代理服务器
npm run server

# 同时启动前端和代理服务器
npm run dev:all

# 构建生产版本
npm run build
```

## 技术栈

- React 18
- TypeScript
- Vite
- Express
- Axios
- MD5 签名
