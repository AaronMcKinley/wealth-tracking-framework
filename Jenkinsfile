pipeline {
  agent any

  environment {
    TERM = 'xterm'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Debug Environment') {
      steps {
        echo 'Debugging Environment Info...'
        sh 'uname -a'
        sh 'echo Hostname: $(hostname)'
        sh 'hostname -I || echo "No IP found"'
      }
    }

    stage('Ensure Docker Network Exists') {
      steps {
        echo 'Ensuring Docker network `wtfnet` exists...'
        sh 'docker network inspect wtfnet >/dev/null 2>&1 || docker network create wtfnet'
      }
    }

    stage('Build Custom Cypress Image') {
      steps {
        echo 'Building custom Cypress Docker image...'
        sh 'docker build -t custom-cypress:13.11 ./cypress-wtf'
      }
    }

    stage('Run Smoke Tests') {
      steps {
        echo "--- Running Cypress Tests ---"
        sh '''
          docker run --rm \
            --network=wealth-tracking-framework_wtfnet \
            -e CYPRESS_BASE_URL=http://wtf-react:3000 \
            custom-cypress:13.11
        '''
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'cypress-wtf/cypress/screenshots/**/*.*', allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress-wtf/cypress/videos/**/*.*', allowEmptyArchive: true
    }
    failure {
      echo 'Smoke tests failed.'
    }
  }
}
