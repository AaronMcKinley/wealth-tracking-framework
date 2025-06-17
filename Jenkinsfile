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
        echo '--- Waiting for React App to Be Ready ---'
        sh '''
          echo "Polling $CYPRESS_BASE_URL until ready..."
          until curl -s $CYPRESS_BASE_URL > /dev/null; do
            echo "Waiting for $CYPRESS_BASE_URL..."
            sleep 2
          done

          echo '--- Running Cypress Smoke Tests ---'
          docker run --rm \
            --network=$DOCKER_NETWORK \
            -e CYPRESS_BASE_URL=$CYPRESS_BASE_URL \
            -v $PWD/$ALLURE_RESULTS_DIR:/app/allure-results \
            custom-cypress:13.11
        '''
      }
    }

   stage('Generate Allure Report') {
     steps {
       echo 'Creating Allure project and generating report...'
       sh '''
         curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/projects/$ALLURE_PROJECT_ID" || true

         curl -sf -X POST "$ALLURE_SERVICE_URL/allure-docker-service/generate-report?project_id=$ALLURE_PROJECT_ID" \
           -H "Content-Type: application/json" \
           -d "{
                 \\"reportName\\": \\"Smoke Tests\\",
                 \\"buildName\\": \\"Build #${BUILD_NUMBER}\\",
                 \\"buildOrder\\": \\"${BUILD_NUMBER}\\"
               }"
       '''
       echo "Allure Report URL: $ALLURE_SERVICE_URL/projects/$ALLURE_PROJECT_ID/reports/latest/index.html"
     }
   }

  post {
    always {
      archiveArtifacts artifacts: 'cypress-wtf/cypress/screenshots/**/*.*', allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress-wtf/cypress/videos/**/*.*', allowEmptyArchive: true
    }
    failure {
      echo 'Smoke tests failed.'
    }
  }
}
