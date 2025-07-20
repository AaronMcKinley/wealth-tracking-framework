pipeline {
    agent any

    environment {
        DOCKER_NETWORK = "wtfnet"
        CYPRESS_BASE_URL = "http://wtf-react:3000"
        CYPRESS_PROJECT_DIR_IN_WORKSPACE = "cypress-wtf"
        CYPRESS_PROJECT_DIR_IN_CONTAINER = "/app"
        ALLURE_DOCKER_SERVICE_URL = "http://localhost:5050"
        ALLURE_PROJECT_ID = "wtf"
        REPORT_NAME = "Smoke Tests"
        ACTUAL_JENKINS_HOST_WORKSPACE_PATH = "/Users/aaronmckinley/wtf-wealth-tracking-framework/wealth-tracking-framework/jenkins_data/workspace/wtf-smoke"
        CYPRESS_CONTAINER_NAME = "jenkins-cypress-debug"
    }

    stages {

        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Ensure Docker Network Exists') {
            steps {
                sh "docker network inspect ${DOCKER_NETWORK} || docker network create ${DOCKER_NETWORK}"
            }
        }

        stage('Build Cypress Image') {
            steps {
                sh "docker build --no-cache -t custom-cypress:13.11 ./${CYPRESS_PROJECT_DIR_IN_WORKSPACE}"
            }
        }

        stage('Wait for React Frontend') {
            steps {
                sh '''
                  echo "Waiting for React frontend to be ready at ${CYPRESS_BASE_URL} ..."
                  ATTEMPTS=0
                  MAX_ATTEMPTS=20
                  SLEEP_TIME=5

                  while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
                    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" ${CYPRESS_BASE_URL} || true)
                    if [ "$STATUS_CODE" = "200" ]; then
                      echo "React frontend is ready! (HTTP $STATUS_CODE)"
                      exit 0
                    else
                      ATTEMPTS=$((ATTEMPTS+1))
                      echo "React not ready yet (attempt $ATTEMPTS/$MAX_ATTEMPTS, status: $STATUS_CODE). Retrying in ${SLEEP_TIME}s..."
                      sleep $SLEEP_TIME
                    fi
                  done

                  echo "ERROR: React frontend did not become ready in time!"
                  exit 1
                '''
            }
        }

        stage('Run Smoke Tests in Persistent Cypress Container') {
            steps {
                sh '''
                  echo "--- PRE-CLEANUP: Removing any stale Cypress container ---"
                  docker rm -f ${CYPRESS_CONTAINER_NAME} || true

                  echo "--- Starting Cypress container that will persist after tests ---"
                  docker run -d --name ${CYPRESS_CONTAINER_NAME} \
                    --network="${DOCKER_NETWORK}" \
                    -e CI=true \
                    -e CYPRESS_BASE_URL="${CYPRESS_BASE_URL}" \
                    -v "${ACTUAL_JENKINS_HOST_WORKSPACE_PATH}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}:${CYPRESS_PROJECT_DIR_IN_CONTAINER}" \
                    -w "${CYPRESS_PROJECT_DIR_IN_CONTAINER}" \
                    custom-cypress:13.11 \
                    sh -c "echo '--- Running Cypress Tests ---' && \
                           npx cypress run --spec 'smoke/**/*.cy.js' --browser chromium --e2e --config video=false --headed || true && \
                           echo '--- Cypress Finished (even if failed) ---' && \
                           tail -f /dev/null"
                '''
            }
        }
    }

    post {
        always {
            script {
                echo "Pipeline complete. The Cypress container is still running for debugging."
                echo "You can now inspect it with:"
                echo "  docker exec -it ${CYPRESS_CONTAINER_NAME} sh"
                echo "Then check allure results:"
                echo "  ls -lah /app/allure-results"
                echo ""
                echo "When done debugging, remove the container manually:"
                echo "  docker rm -f ${CYPRESS_CONTAINER_NAME}"
            }
        }
    }
}
