FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y python3 python3-pip ssh git curl gnupg software-properties-common docker.io && \
    pip3 install ansible docker && \
    apt-get clean

# Install required Ansible collections
RUN ansible-galaxy collection install community.docker

WORKDIR /app

COPY . /app

RUN chmod +x /app/deploy.sh

ENTRYPOINT ["/app/deploy.sh"]
