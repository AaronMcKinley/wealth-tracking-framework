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
        dir('cypress-wtf') {
          sh 'rm -rf cypress-wtf/node_modules'
          sh 'rm -rf cypress-wtf/cypress'
          sh 'npm ci'
        }
      }
    }

    stage('Run Smoke Tests') {
      steps {
        echo "--- Running Cypress Tests ---"
        sh '''
          echo "--- Verifying config presence ---"
          ls -l $(pwd)/cypress-wtf
          cat $(pwd)/cypress-wtf/cypress.config.js | head -n 10

          docker run --rm \
            --network=wealth-tracking-framework_wtfnet \
            -e CYPRESS_BASE_URL=http://wtf-react:3000 \
            -v "$(pwd)/cypress-wtf:/app" \
            -w /app \
            cypress/included:13.11.0 \
            cypress run \
            --config-file /app/cypress.config.js \
            --spec "smoke/**/*.cy.js"
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
