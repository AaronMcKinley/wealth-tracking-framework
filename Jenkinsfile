pipeline {
  agent any

  environment {
    TERM = 'xterm'
    DOCKER_NETWORK = 'wtfnet'
    CYPRESS_BASE_URL = 'http://wtf-react:3000'
    ALLURE_SERVICE_URL = 'http://localhost:5050'
    ALLURE_PROJECT_ID = 'wtf'
    CYPRESS_PROJECT_DIR_IN_WORKSPACE = "cypress-wtf"
    ALLURE_RESULTS_DIR_ON_HOST = "${WORKSPACE}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/allure-results"
    CYPRESS_PROJECT_DIR_IN_CONTAINER = "/app" // This is the target directory inside the container for the volume mount
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
        sh "docker build -t custom-cypress:13.11 ./${CYPRESS_PROJECT_DIR_IN_WORKSPACE}"
      }
    }

    stage('Run Smoke Tests in Dedicated Container') {
      steps {
        sh '''
          echo "Running Cypress volume mount test..."
          docker run --name jenkins-cypress-debug \
            --network="$DOCKER_NETWORK" \
            -e CYPRESS_BASE_URL="$CYPRESS_BASE_URL" \
            -v "${WORKSPACE}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}:${CYPRESS_PROJECT_DIR_IN_CONTAINER}" \
            -w "${CYPRESS_PROJECT_DIR_IN_CONTAINER}" \
            --entrypoint "/bin/sh" \
            custom-cypress:13.11 \
            -c "ls -la ${CYPRESS_PROJECT_DIR_IN_CONTAINER}; echo '--- End of Container /app Content ---'"
        '''
      }
    }
  }

  post {
    always {
      script {
        echo 'Uploading results to Allure and generating report...'

        sh '''
          if [ -d "$ALLURE_RESULTS_DIR_ON_HOST" ] && [ "$(ls -A $ALLURE_RESULTS_DIR_ON_HOST)" ]; then
            cd "$ALLURE_RESULTS_DIR_ON_HOST"
            zip -r /tmp/allure-results.zip . || echo "Zipping failed"
          else
            echo "No Allure results found in $ALLURE_RESULTS_DIR_ON_HOST. Creating empty zip."
            touch /tmp/dummy_empty_file_for_zip
            zip -j /tmp/allure-results.zip /tmp/dummy_empty_file_for_zip
            rm /tmp/dummy_empty_file_for_zip
          fi
        '''

        sh """
          curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/projects" \
            -H "Content-Type: application/json" \
            -d '{"id": "${ALLURE_PROJECT_ID}", "name": "WTF Smoke Tests"}' || true

          curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/send-results?project_id=${ALLURE_PROJECT_ID}" \
            -F results=@/tmp/allure-results.zip || true

          curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/generate-report?project_id=${ALLURE_PROJECT_ID}" \
            -H "Content-Type: application/json" \
            -d '{
                  "reportName": "Smoke Tests",
                  "buildName": "Build #${BUILD_NUMBER}",
                  "buildOrder": "${BUILD_NUMBER}"
                }' || true
        """

        echo "Allure Report: $ALLURE_SERVICE_URL/projects/$ALLURE_PROJECT_ID/reports/latest/index.html"
      }

      archiveArtifacts artifacts: "${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/cypress/videos/**/*, ${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/cypress/screenshots/**/*", allowEmptyArchive: true
    }
    failure {
      echo 'Some Cypress tests failed. See Allure report for details.'
    }
  }
}