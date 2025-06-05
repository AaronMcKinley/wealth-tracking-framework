pipeline {
  agent any

  environment {
    TERM = 'xterm'
    CYPRESS_BASE_URL = 'http://wtf-react:3000'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Debug Environment') {
      steps {
        echo '🔍 Debugging Environment Info...'
        sh 'uname -a'
        sh 'echo Hostname: $(hostname)'
        sh 'hostname -I || echo "No IP found"'
        sh 'printenv | grep CYPRESS'
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
        dir('cypress') {
          sh 'npx cypress run --spec "smoke/**/*.cy.js"'
        }
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
