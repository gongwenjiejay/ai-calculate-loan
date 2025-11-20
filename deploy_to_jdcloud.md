# 部署到京东云 (JD Cloud) 指南

本指南介绍如何将 AI 智能房贷计算器部署到京东云服务器。

## 方式一：使用 Docker 部署（推荐）

Docker 部署方式最简单，环境一致性最好。

### 1. 准备工作
确保你的京东云服务器（云主机）已经安装了 Docker。如果没有，请先安装：
```bash
# CentOS / Alibaba Cloud Linux
yum install -y docker
systemctl start docker
systemctl enable docker
```

### 2. 上传代码
将整个项目文件夹上传到服务器，或者在服务器上 git clone。

### 3. 构建镜像
在项目根目录下运行：
```bash
docker build -t mortgage-calc .
```

### 4. 运行容器
```bash
# 将容器的 80 端口映射到服务器的 80 端口
docker run -d -p 80:80 --name mortgage-app mortgage-calc
```

### 5. 访问
在浏览器输入你的京东云服务器公网 IP，即可访问。

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
