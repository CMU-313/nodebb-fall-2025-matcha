# Base image remains the same
FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# Existing RUN block for project-specific dependencies
RUN apt-get update \
 && apt-get install -y \
        iputils-ping \
        redis-server \
 && rm -rf /var/lib/apt/lists/*

# Existing RUN block for qlty tool
RUN curl https://qlty.sh | /bin/bash \
 && mv ~/.qlty/bin/qlty /usr/local/bin/qlty \
 && rm -rf ~/.qlty \
 && qlty --version

# --------------------------------------------------------------------------
# NEW BLOCK FOR callGraph INSTALLATION
# --------------------------------------------------------------------------

RUN apt-get update \
 && apt-get install -y \
        graphviz \
        perl \
        make \
        cpanminus \
    --no-install-recommends \
 && rm -rf /var/lib/apt/lists/*

RUN cpanm install GraphViz

COPY callGraph /usr/local/bin/callGraph
RUN chmod +x /usr/local/bin/callGraph