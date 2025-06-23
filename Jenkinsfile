pipeline {
  agent any

  environment {
    TERM = 'xterm'
    DOCKER_NETWORK = 'wtfnet'
    CYPRESS_BASE_URL = 'http://wtf-react:3000'
    ALLURE_SERVICE_URL = 'http://localhost:5050'
    ALLURE_PROJECT_ID = 'wtf'
    CYPRESS_DIR = "${WORKSPACE}/cypress-wtf"
    ALLURE_RESULTS_DIR = "${WORKSPACE}/cypress-wtf/allure-results"
    ALLURE_ZIP = "${WORKSPACE}/allure-results.zip"
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
          docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1 || \
          docker network create "$DOCKER_NETWORK"
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
            -v $CYPRESS_DIR/smoke:/smoke/smoke \
            -v $CYPRESS_DIR/support:/smoke/support \
            -v $CYPRESS_DIR/cypress.config.js:/smoke/cypress.config.js \
            -v $ALLURE_RESULTS_DIR:/smoke/allure-results \
            -w /smoke \
            custom-cypress:13.11 \
            sh -c "npx cypress run || true"
        '''
      }
    }
  }

  post {
    always {
      script {
        echo 'Uploading results to Allure and generating report...'

        // Safely package Allure results if they exist
        sh '''
          if [ -d "$ALLURE_RESULTS_DIR" ] && [ "$(ls -A $ALLURE_RESULTS_DIR)" ]; then
            cd "$ALLURE_RESULTS_DIR"
            zip -r "$ALLURE_ZIP" . || echo "Zipping failed"
          else
            echo "Warning: No Allure results found in $ALLURE_RESULTS_DIR"
            touch "$ALLURE_ZIP"
          fi
        '''

        // Upload and trigger Allure report generation
        sh """
          curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/projects" \
            -H "Content-Type: application/json" \
            -d '{\"id\": \"$ALLURE_PROJECT_ID\", \"name\": \"WTF Smoke Tests\"}' || true

          curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/send-results?project_id=$ALLURE_PROJECT_ID" \
            -F results=@$ALLURE_ZIP || true

          curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/generate-report?project_id=$ALLURE_PROJECT_ID" \
            -H "Content-Type: application/json" \
            -d '{\"reportName\": \"Smoke Tests\", \"buildName\": \"Build #${BUILD_NUMBER}\", \"buildOrder\": \"${BUILD_NUMBER}\"}' || true
        """

        echo "Allure Report: $ALLURE_SERVICE_URL/projects/$ALLURE_PROJECT_ID/reports/latest/index.html"
      }

      archiveArtifacts artifacts: 'cypress-wtf/cypress-artifacts/**/*.*', allowEmptyArchive: true
    }

    failure {
      echo 'Some Cypress tests failed. See Allure report for details.'
    }
  }
}
