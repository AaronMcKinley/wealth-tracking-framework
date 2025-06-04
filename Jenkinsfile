pipeline {
  agent any

  environment {
    CYPRESS_BASE_URL = 'http://wtf-react:3000'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Cypress Dependencies') {
      steps {
        dir('cypress') {
          sh '''
            npm ci
            npm install wait-on
          '''
        }
      }
    }

    stage('Wait for Frontend') {
      steps {
        dir('cypress') {
          sh 'npx wait-on $CYPRESS_BASE_URL'
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
