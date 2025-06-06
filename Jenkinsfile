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

    stage('Install Cypress Dependencies') {
      steps {
        dir('cypress') {
          sh 'npm ci'
        }
      }
    }

    stage('Run Smoke Tests') {
      steps {
        sh '''
        echo "--- Listing /app before test run ---"
        docker run --rm \
          -v /var/jenkins_home/workspace/wtf-smoke/cypress:/app \
          alpine ls -la /app

        echo "--- Running Cypress ---"
        docker run --rm \
          --network=wealth-tracking-framework_wtfnet \
          -e CYPRESS_BASE_URL=http://wtf-react:3000 \
          -v /var/jenkins_home/workspace/wtf-smoke/cypress:/app \
          -w /app \
          cypress/included:13.7.3 \
          cypress run --config-file ./cypress.config.js --spec cypress/smoke/login/login.cy.js
        '''
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'cypress/cypress/screenshots/**/*.*', allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress/cypress/videos/**/*.*', allowEmptyArchive: true
    }
    failure {
      echo 'Smoke tests failed.'
    }
  }
}
