FROM jenkins/jenkins:lts

USER root

# Optional: install Docker CLI inside the Jenkins container
RUN apt-get update && apt-get install -y docker.io

USER jenkins

# Install plugins from plugins.txt if it exists
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

