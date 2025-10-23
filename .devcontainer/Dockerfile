FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

RUN apt-get update \
 && apt-get install -y \
        iputils-ping \
        redis-server \
 && rm -rf /var/lib/apt/lists/*

RUN curl https://qlty.sh | /bin/bash \
 && mv ~/.qlty/bin/qlty /usr/local/bin/qlty \
 && rm -rf ~/.qlty \
 && qlty --version

RUN curl -L https://github.com/grafana/k6/releases/download/v1.3.0/k6-v1.3.0-linux-amd64.tar.gz -o /tmp/k6.tar.gz \
 && tar -xzf /tmp/k6.tar.gz -C /tmp \
 && mv /tmp/k6-v1.3.0-linux-amd64/k6 /usr/local/bin/ \
 && rm -rf /tmp/k6* \
 && k6 version
