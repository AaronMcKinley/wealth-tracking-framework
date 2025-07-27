FROM jenkins/jenkins:lts

USER root

ARG DOCKER_GID=20

RUN groupadd -for -g ${DOCKER_GID} docker && \
    usermod -aG docker jenkins

RUN apt-get update && apt-get install -y \
    curl \
    git \
    docker.io \
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

RUN mkdir -p ~/.docker/cli-plugins && \
    ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/') && \
    echo "Detected arch: $ARCH" && \
    curl -SL https://github.com/docker/buildx/releases/latest/download/buildx-linux-$ARCH \
        -o ~/.docker/cli-plugins/docker-buildx && \
    chmod +x ~/.docker/cli-plugins/docker-buildx

USER jenkins

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
