FROM node:alpine as builder
LABEL MAINTAINER="huyiyang@tiwater.com"

RUN apk add --update --no-cache git

# 克隆并构建自定义的scratch-vm
RUN git clone https://github.com/huyyxy/scratch-vm.git /scratch-vm-custom
WORKDIR /scratch-vm-custom
RUN npm install
RUN npm run build
# 创建scratch-vm的tgz包
RUN npm pack
# 查看生成的包文件（用于调试）
RUN ls -la *.tgz

# 克隆scratch-gui
RUN git clone https://github.com/scratchfoundation/scratch-gui.git /scratch-gui-custom
WORKDIR /scratch-gui-custom

# 安装自定义的scratch-vm tgz包
RUN npm install /scratch-vm-custom/scratch-vm-*.tgz

# 安装其他依赖并构建
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=builder /scratch-gui-custom/build /usr/share/nginx/html