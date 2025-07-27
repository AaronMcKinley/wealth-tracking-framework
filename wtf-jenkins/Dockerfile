FROM jenkins/jenkins:lts

USER root

ARG DOCKER_GID=20

RUN groupadd -for -g ${DOCKER_GID} docker && \
    usermod -aG docker jenkins

RUN apt-get update && apt-get install -y \
    curl \
    git \
    docker.io \
    docker-compose-plugin \
    xvfb \
    libgtk-3-0 \
    libxss1 \
    libasound2 \
    libnss3 \
    libxshmfence1 \
    libgbm1 \
    libx11-xcb1 \
    libatk-bridge2.0-0 \
    zip && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/libexec/docker/cli-plugins && \
    ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/') && \
    echo "Detected arch: $ARCH" && \
    curl -SL https://github.com/docker/buildx/releases/latest/download/buildx-v0.13.1.linux-$ARCH \
        -o /usr/libexec/docker/cli-plugins/docker-buildx && \
    chmod +x /usr/libexec/docker/cli-plugins/docker-buildx && \
    ln -sf /usr/libexec/docker/cli-plugins/docker-buildx /usr/lib/docker/cli-plugins/docker-buildx && \
    ln -sf /usr/libexec/docker/cli-plugins/docker-buildx /root/.docker/cli-plugins/docker-buildx

USER jenkins

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
