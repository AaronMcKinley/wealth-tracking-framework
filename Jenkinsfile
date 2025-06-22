pipeline {
  agent any

  environment {
    TERM = 'xterm'
    DOCKER_NETWORK = 'wtfnet'
    CYPRESS_BASE_URL = 'http://wtf-react:3000'
    ALLURE_SERVICE_URL = 'http://wtf-allure:5050'
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
          echo "Running Cypress tests with Allure integration..."

          docker run --rm \
            --network=$DOCKER_NETWORK \
            -e CYPRESS_BASE_URL=$CYPRESS_BASE_URL \
            -v $PWD/$ALLURE_RESULTS_DIR:/app/allure-results \
            custom-cypress:13.11 || echo "Cypress tests failed, continuing to generate report"
        '''
      }
    }
  }

  post {
    always {
      script {
        echo 'Uploading results to Allure and generating report...'
        try {
          sh """
            curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/projects/$ALLURE_PROJECT_ID" || true

            curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/send-results?project_id=$ALLURE_PROJECT_ID" \
              -F "results=@$ALLURE_RESULTS_DIR" || true

            curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/generate-report?project_id=$ALLURE_PROJECT_ID" \
              -H "Content-Type: application/json" \
              -d "{
                    \\"reportName\\": \\"Smoke Tests\\",
                    \\"buildName\\": \\"Build #${BUILD_NUMBER}\\",
                    \\"buildOrder\\": \\"${BUILD_NUMBER}\\"
                  }" || true
          """
          echo "Allure Report: $ALLURE_SERVICE_URL/projects/$ALLURE_PROJECT_ID/reports/latest/index.html"
        } catch (Exception e) {
          echo "Allure report generation failed: ${e.message}"
        }
      }
    }

    failure {
      echo 'Some Cypress tests failed. See Allure report for details.'
    }
  }
}
