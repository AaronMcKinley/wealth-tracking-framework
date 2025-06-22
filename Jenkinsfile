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

    stage('Prepare Environment') {
      steps {
        echo 'Preparing allure results directory...'
        sh '''
          mkdir -p $ALLURE_RESULTS_DIR
          chmod -R 777 $ALLURE_RESULTS_DIR
        '''
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
        echo 'Ensuring Docker network exists...'
        sh '''
          docker network inspect $DOCKER_NETWORK >/dev/null 2>&1 || \
          docker network create $DOCKER_NETWORK
        '''
      }
    }

    stage('Build Custom Cypress Image') {
      steps {
        echo 'Building custom Cypress Docker image...'
        sh 'docker build -t custom-cypress:13.11 ./cypress-wtf'
      }
    }

    stage('Run Smoke Tests') {
      steps {
        echo 'Waiting for React App to be ready...'
        sh '''
          echo "Polling $CYPRESS_BASE_URL until ready..."
          until curl -s $CYPRESS_BASE_URL > /dev/null; do
            echo "Waiting for $CYPRESS_BASE_URL..."
            sleep 2
          done

          echo 'Running Cypress Smoke Tests...'
          docker run --rm \
            --network=$DOCKER_NETWORK \
            -e CYPRESS_BASE_URL=$CYPRESS_BASE_URL \
            -v $PWD/$ALLURE_RESULTS_DIR:/results \
            custom-cypress:13.11 \
            sh -c "cypress run && cp -r allure-results/* /results && ls -la /results"
        '''
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'cypress-wtf/cypress/screenshots/**/*.*', allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress-wtf/cypress/videos/**/*.*', allowEmptyArchive: true

      script {
        echo 'Creating Allure project, uploading results, and generating report...'

        try {
          sh """
            curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/projects/$ALLURE_PROJECT_ID" || true
          """

          sh '''
            if [ -d "$ALLURE_RESULTS_DIR" ] && [ "$(ls -A $ALLURE_RESULTS_DIR)" ]; then
              zip -r allure-results.zip $ALLURE_RESULTS_DIR
            else
              echo "Warning: No Allure results found at $ALLURE_RESULTS_DIR"
              touch allure-results.zip
            fi
          '''

          sh """
            curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/send-results?project_id=$ALLURE_PROJECT_ID" \
              -H "Content-Type: multipart/form-data" \
              -F "results=@allure-results.zip" || true
          """

          sh """
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
      echo 'Smoke tests failed.'
    }
  }
}
