# 部署到京东云 (JD Cloud) 指南

本指南介绍如何将 AI 智能房贷计算器部署到京东云服务器。

## 方式一：使用 Docker 部署（推荐）

Docker 部署方式最简单，环境一致性最好。

### 1. 准备工作
# 部署到京东云指南

## 1. 准备工作

确保你已经登录到京东云服务器，并且安装了 Docker。

## 2. 构建 Docker 镜像

在项目根目录下运行以下命令构建镜像：

```bash
docker build -t ai-mortgage-calculator .
```

## 3. 运行容器

使用以下命令运行容器，将服务器的 80 端口映射到容器的 80 端口：

```bash
# 务必传递 DEEPSEEK_API_KEY 环境变量
docker run -d -p 80:80 \
  -e DEEPSEEK_API_KEY=your_api_key_here \
  --name ai-calculator \
  ai-mortgage-calculator
```

> **注意**: 请将 `your_api_key_here` 替换为你的实际 DeepSeek API Key。

## 4. 验证部署

部署完成后，通过浏览器访问：

```
https://117.72.79.201/ailoan
```

或者直接访问 IP（会自动跳转）：

```
http://117.72.79.201
```

## 5. 常见问题排查

- **无法访问**: 检查京东云安全组是否开放了 80 端口 (HTTP) 和 443 端口 (HTTPS)。
- **API 报错**: 检查容器日志确认 API Key 是否正确传递：
    ```bash
    docker logs ai-calculator
    ```

---

## 方式二：手动部署 (Nginx)

如果你不想用 Docker，也可以手动编译和部署。

### 1. 编译项目
在本地电脑上执行：
```bash
npm run build
```
这会生成一个 `dist` 文件夹。

### 2. 安装 Nginx
在京东云服务器上安装 Nginx：
```bash
yum install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 3. 上传文件
将本地 `dist` 文件夹里的**所有内容**上传到服务器的 `/usr/share/nginx/html/` 目录（覆盖原有文件）。

### 4. 配置 Nginx (解决刷新 404 问题)
编辑 nginx 配置文件 (通常在 `/etc/nginx/nginx.conf` 或 `/etc/nginx/conf.d/default.conf`)，确保 `location /` 部分如下：

```nginx
location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html; # 关键：支持 SPA 路由
}
```

### 5. 重启 Nginx
```bash
nginx -s reload
```

## 注意事项
- **安全组**: 记得在京东云控制台的“安全组”设置中，开放 **80 端口** (HTTP)。
- **API Key**: 生产环境建议将 API Key 放在后端，或者确保你的前端代码混淆。本项目目前是纯前端，API Key 会暴露在网络请求中，请注意风险。
