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
    apt-get install -y nodejs

USER jenkins

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
