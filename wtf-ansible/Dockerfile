FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y python3 python3-pip ssh git curl gnupg software-properties-common docker.io && \
    pip3 install ansible docker && \
    apt-get clean

# Install docker compose v2 plugin (latest version recommended)
RUN mkdir -p /usr/libexec/docker/cli-plugins && \
    curl -SL https://github.com/docker/compose/releases/download/v2.29.2/docker-compose-linux-x86_64 \
      -o /usr/libexec/docker/cli-plugins/docker-compose && \
    chmod +x /usr/libexec/docker/cli-plugins/docker-compose

# Install required Ansible collections
RUN ansible-galaxy collection install community.docker

WORKDIR /app

COPY . /app

RUN chmod +x /app/deploy.sh

ENTRYPOINT ["/app/deploy.sh"]
