pipeline {
  agent any

  environment {
    TERM = 'xterm'
    DOCKER_NETWORK = 'wtfnet'
    CYPRESS_BASE_URL = 'http://wtf-react:3000'
    ALLURE_SERVICE_URL = 'http://localhost:5050'
    ALLURE_RESULTS_DIR = 'cypress-wtf/allure-results'
    ALLURE_PROJECT_ID = 'wtf'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Ensure Docker Network Exists') {
      steps {
        sh '''
          docker network inspect $DOCKER_NETWORK >/dev/null 2>&1 || \
          docker network create $DOCKER_NETWORK
        '''
      }
    }

    stage('Build Cypress Image') {
      steps {
        sh 'docker build -t custom-cypress:13.11 ./cypress-wtf'
      }
    }

    stage('Run Cypress Tests') {
      steps {
        sh '''
          echo "Running Cypress tests with Allure..."

          docker run --rm \
            --network=$DOCKER_NETWORK \
            -e CYPRESS_BASE_URL=$CYPRESS_BASE_URL \
            -v $PWD/$ALLURE_RESULTS_DIR:/app/allure-results \
            custom-cypress:13.11 || echo "Cypress tests failed, continuing..."
        '''
      }
    }
  }

  post {
    always {
      script {
        echo 'Uploading results to Allure and generating report...'

        // Ensure the allure-results directory exists and zip it
        sh '''
          if [ -d "$ALLURE_RESULTS_DIR" ] && [ "$(ls -A $ALLURE_RESULTS_DIR)" ]; then
            zip -r allure-results.zip $ALLURE_RESULTS_DIR
          else
            echo "Warning: No Allure results found in $ALLURE_RESULTS_DIR"
            touch allure-results.zip
          fi
        '''

        // Create Allure project and upload results
        sh """
          curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/projects" \
            -H "Content-Type: application/json" \
            -d '{
                  "id": "$ALLURE_PROJECT_ID",
                  "name": "WTF Smoke Tests"
                }' || true

          curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/send-results?project_id=$ALLURE_PROJECT_ID" \
            -F results=@allure-results.zip || true

          curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/generate-report?project_id=$ALLURE_PROJECT_ID" \
            -H "Content-Type: application/json" \
            -d '{
                  "reportName": "Smoke Tests",
                  "buildName": "Build #${BUILD_NUMBER}",
                  "buildOrder": "${BUILD_NUMBER}"
                }' || true
        """

        echo "Allure Report: $ALLURE_SERVICE_URL/projects/$ALLURE_PROJECT_ID/reports/latest/index.html"
      }

      archiveArtifacts artifacts: 'cypress-wtf/cypress-artifacts/screenshots/**/*.*', allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress-wtf/cypress-artifacts/downloads/**/*.*', allowEmptyArchive: true
    }

    failure {
      echo 'Some Cypress tests failed. See Allure report for details.'
    }
  }
}
