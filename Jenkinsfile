pipeline {
  agent any

  environment {
    TERM = 'xterm'
    DOCKER_NETWORK = 'wtfnet'
    CYPRESS_BASE_URL = 'http://wtf-react:3000'
    ALLURE_SERVICE_URL = 'http://localhost:5050'
    ALLURE_PROJECT_ID = 'wtf'
    ALLURE_RESULTS_DIR = '/wtf/allure-results'  // updated to shared volume location
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

    stage('Run Cypress Tests in Container') {
      steps {
        sh '''
          echo "Running Cypress tests from dedicated container..."

          docker compose run --rm wtf-cypress  || true
        '''
      }
    }
  }

  post {
    always {
      script {
        echo 'Uploading results to Allure and generating report...'

        sh '''
          if [ -d "$ALLURE_RESULTS_DIR" ] && [ "$(ls -A $ALLURE_RESULTS_DIR)" ]; then
            cd "$ALLURE_RESULTS_DIR"
            zip -r "/tmp/allure-results.zip" . || echo "Zipping failed"
          else
            echo "Warning: No Allure results found in $ALLURE_RESULTS_DIR"
            touch "/tmp/allure-results.zip"
          fi
        '''

        sh """
          curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/projects" \
            -H "Content-Type: application/json" \
            -d '{"id": "$ALLURE_PROJECT_ID", "name": "WTF Smoke Tests"}' || true

          curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/send-results?project_id=$ALLURE_PROJECT_ID" \
            -F results=@/tmp/allure-results.zip || true

          curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/generate-report?project_id=$ALLURE_PROJECT_ID" \
            -H "Content-Type: application/json" \
            -d '{"reportName": "Smoke Tests", "buildName": "Build #${BUILD_NUMBER}", "buildOrder": "${BUILD_NUMBER}"}' || true
        """

        echo "Allure Report: $ALLURE_SERVICE_URL/projects/$ALLURE_PROJECT_ID/reports/latest/index.html"
      }

      archiveArtifacts artifacts: '**/cypress-artifacts/**/*.*', allowEmptyArchive: true
    }

    failure {
      echo 'Some Cypress tests failed. See Allure report for details.'
    }
  }
}
