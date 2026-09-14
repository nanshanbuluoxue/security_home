# 智能安防微信小程序

这是一个面向家庭安防与环境监测场景的微信小程序项目。小程序通过 MQTT 接入设备端传感器数据，展示温度、湿度、可燃气体浓度、光照、人体/生物活动等状态，并支持灯光、蜂鸣器和报警阈值控制。项目还集成了天气展示、历史数据图表、用户信息、帮助说明和反馈页面。

## 功能特性

- 实时环境监测：展示温度、湿度、气体浓度、光照强度、是否有人等数据。
- MQTT 设备通信：通过 WebSocket MQTT 连接 EMQX 服务，订阅设备上报主题并向设备发布控制指令。
- 报警提醒：根据温湿度阈值和气体报警状态生成报警信息，并通过外部告警接口推送。
- 设备控制：支持灯光开关、蜂鸣器开关，以及温湿度阈值配置。
- 数据分析：从本地后端接口获取历史数据，并使用 uCharts 绘制温度、湿度、气体浓度趋势图。
- 天气组件：基于微信定位、腾讯地图 SDK 与和风天气接口展示本地天气。
- 分包页面：包含服务条款、问题反馈、使用帮助等辅助页面。

## 技术栈

- 微信小程序原生框架
- Vant Weapp 组件库
- MobX 小程序状态管理
- MQTT.js
- uCharts / qiun-wx-ucharts
- 腾讯地图微信小程序 SDK
- 和风天气 API

## 目录结构

```text
.
|-- app.js / app.json / app.wxss      # 小程序全局入口与配置
|-- pages
|   |-- home                          # 首页：MQTT 连接、实时数据、设备控制、报警
|   |-- analysis                      # 数据分析：历史图表
|   |-- setting                       # 设置：阈值、灯光、蜂鸣器
|   `-- about                         # 我的：用户信息
|-- subpkg
|   `-- pages
|       |-- clause                    # 条款页面
|       |-- feedback                  # 反馈页面
|       `-- help                      # 帮助页面
|-- components
|   |-- weather                       # 天气组件
|   `-- navigation-bar                # 自定义导航栏组件
|-- store
|   `-- store.js                      # MobX 全局状态
|-- utils
|   |-- mqtt.min.js                   # MQTT 客户端
|   |-- qqmap-wx-jssdk.js             # 腾讯地图 SDK
|   `-- util.js                       # 工具方法
|-- static                            # 图片、天气图标等静态资源
|-- miniprogram_npm                   # 微信开发者工具构建后的小程序 npm 产物
|-- package.json                      # npm 依赖声明
`-- project.config.json               # 微信开发者工具项目配置
```

## 环境要求

- Node.js
- npm
- 微信开发者工具
- 可访问的 MQTT Broker，需支持微信小程序使用的 `wxs://` 连接
- 可选：本地历史数据后端服务，默认接口地址为 `http://127.0.0.1:3777`

## 安装与运行

1. 安装依赖：

```bash
npm install
```

2. 使用微信开发者工具导入项目根目录。

3. 在微信开发者工具中构建 npm：

```text
工具 -> 构建 npm
```

4. 编译运行小程序。

## 关键配置

### MQTT 配置

MQTT 连接配置位于 `pages/home/home.js`：

```js
host: "s59f1af5.ala.dedicated.aliyun.emqxcloud.cn:8084",
subTopic: "publish",
mqttOptions: {
  clientId: "miniprogram",
  username: "miniprogram",
  password: "123456"
}
```

小程序连接时会使用：

```text
wxs://<host>/mqtt
```

设备控制消息会发布到全局状态中的 `pubTopic`，默认值在 `store/store.js` 中配置为 `subtopic`。

### 设备上报数据格式

首页接收 MQTT 消息后会按 JSON 解析，预期字段包括：

```json
{
  "tem": 26.5,
  "hum": 55,
  "gas": 120,
  "photo": 300,
  "person": 1,
  "light_per": 1,
  "l_tem": 15,
  "h_tem": 35,
  "l_hum": 30,
  "h_hum": 60,
  "gas_warn": 0
}
```

### 后端数据接口

项目中有两个本地后端接口调用：

- `POST http://127.0.0.1:3777/api/gather`：首页定时上传当前传感器数据。
- `POST http://127.0.0.1:3777/api/getdata/init`：分析页获取历史图表数据。

如果需要在真机预览或线上使用，请将接口替换为可访问的 HTTPS 服务，并在微信小程序后台配置 request 合法域名。

### 天气与定位配置

天气组件位于 `components/weather/weather.js`，使用：

- `wx.getFuzzyLocation` 获取模糊定位。
- 腾讯地图 SDK 进行逆地址解析。
- 和风天气接口获取天气数据。

请根据自己的账号替换以下密钥：

- 腾讯地图 Key：`components/weather/weather.js` 中 `QQMapWX({ key: "..." })`
- 和风天气 Key：`components/weather/weather.js` 中 `var key = "..."`

同时需要在小程序后台配置对应的 request 合法域名。

## 页面说明

- 首页：首页展示天气、连接状态、传感器数据、报警数量，并提供灯光和蜂鸣器快捷开关。
- 数据：展示温度、湿度、气体浓度历史折线图。
- 设置：配置温湿度上下限、灯光开关和蜂鸣器开关，并通过 MQTT 下发。
- 我的：支持用户头像和昵称信息展示。
- 帮助：介绍天气查看、家庭环境监测、灯光控制、入侵监测和报警功能。

## 注意事项

- 当前项目中的部分源码中文注释或文本可能存在编码显示问题，建议统一使用 UTF-8 保存文件。
- `node_modules` 和 `miniprogram_npm` 已存在于项目目录中；如果重新安装依赖，建议重新执行微信开发者工具的“构建 npm”。
- 微信小程序真机环境要求网络请求域名、WebSocket 域名均完成合法域名配置。
- MQTT 用户名、密码、天气 Key、地图 Key 等敏感信息不建议直接提交到公开仓库。
- `package.json` 中暂未配置有效测试命令，当前项目主要通过微信开发者工具编译和真机预览验证。

## 依赖列表

主要 npm 依赖如下：

- `@vant/weapp`
- `mobx-miniprogram`
- `mobx-miniprogram-bindings`
- `@qiun/ucharts`
- `@qiun/wx-ucharts`

## 开发建议

- 修改页面或组件后，优先在微信开发者工具中重新编译验证。
- 修改 npm 依赖后，执行 `npm install` 并重新“构建 npm”。
- 修改 MQTT 主题或消息字段时，需要同步调整设备端、小程序端和后端接口的数据协议。
- 上线前请替换本地接口、检查合法域名、清理测试密钥，并确认隐私权限说明符合微信小程序审核要求。
