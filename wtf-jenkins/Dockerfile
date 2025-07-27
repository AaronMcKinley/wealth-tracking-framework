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
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p ~/.docker/cli-plugins && \
    ARCH=amd64 && \
    curl -SL https://github.com/docker/buildx/releases/latest/download/buildx-linux-$ARCH \
        -o ~/.docker/cli-plugins/docker-buildx && \
    chmod +x ~/.docker/cli-plugins/docker-buildx

USER jenkins
