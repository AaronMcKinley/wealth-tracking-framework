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
    CYPRESS_PROJECT_DIR_IN_CONTAINER = "/app"
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
          echo "Running Cypress smoke tests in dedicated container..."
          // >>> DEBUGGING START: Temporarily keeps container and lists/cats files <<<
          docker run --name jenkins-cypress-debug \
            --network=$DOCKER_NETWORK \
            -e CYPRESS_BASE_URL=$CYPRESS_BASE_URL \
            -v ${WORKSPACE}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}:${CYPRESS_PROJECT_DIR_IN_CONTAINER} \
            -w ${CYPRESS_PROJECT_DIR_IN_CONTAINER} \
            custom-cypress:13.11 \
            sh -c "ls -la; cat cypress.config.js; npx cypress run --config-file=cypress.config.js --spec smoke/**/*.cy.js"
          // >>> DEBUGGING END <<<
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
            echo "No Allure results found in $ALLURE_RESULTS_DIR_ON_HOST. Creating dummy zip."
            zip -j /tmp/allure-results.zip /dev/null
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
    // >>> DEBUGGING START: cleanedUp block TEMPORARILY COMMENTED OUT <<<
    // cleanedUp {
    //   echo "Cleaning up temporary Cypress debug container..."
    //   sh 'docker stop jenkins-cypress-debug || true'
    //   sh 'docker rm jenkins-cypress-debug || true'
    // }
    // >>> DEBUGGING END <<<
    failure {
      echo 'Some Cypress tests failed. See Allure report for details.'
    }
  }
}