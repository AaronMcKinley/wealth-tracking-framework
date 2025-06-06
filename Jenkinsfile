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
        echo '--- Verifying Cypress Files in /app and Running Tests ---'
        sh '''
          echo "--- Listing all files in /app ---"
          docker run --rm \
            -v "$PWD/cypress:/app" \
            -w /app \
            alpine \
            sh -c "find . -type f"

          echo "--- Running Cypress Tests ---"
          docker run --rm \
            --network=wealth-tracking-framework_wtfnet \
            -e CYPRESS_BASE_URL=http://wtf-react:3000 \
            -v "$PWD/cypress:/app" \
            -w /app \
            cypress/included:13.7.3 \
            cypress run --config-file cypress.config.js --spec smoke/**/*.cy.js
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
