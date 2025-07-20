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

        stage('Run Smoke Tests in Dedicated Container') {
            steps {
                sh '''
                  echo "--- PRE-CLEANUP: Removing any stale Cypress container ---"
                  docker rm -f ${CYPRESS_CONTAINER_NAME} || true
                  docker container prune -f || true
                  docker volume prune -f || true

                  echo "--- Starting Cypress Test Execution ---"
                  echo "Host Path to Cypress Project: ${ACTUAL_JENKINS_HOST_WORKSPACE_PATH}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}"

                  docker run -d --name ${CYPRESS_CONTAINER_NAME} \
                    --network="${DOCKER_NETWORK}" \
                    -e CI=true \
                    -e CYPRESS_BASE_URL="${CYPRESS_BASE_URL}" \
                    -v "${ACTUAL_JENKINS_HOST_WORKSPACE_PATH}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}:${CYPRESS_PROJECT_DIR_IN_CONTAINER}" \
                    -w "${CYPRESS_PROJECT_DIR_IN_CONTAINER}" \
                    custom-cypress:13.11

                  echo "--- Debugging frontend content before running Cypress ---"
                  docker exec ${CYPRESS_CONTAINER_NAME} curl -s ${CYPRESS_BASE_URL} | head -20

                  echo "--- Executing Cypress tests inside the container (Chromium) ---"
                  docker exec ${CYPRESS_CONTAINER_NAME} npx cypress run --spec "smoke/**/*.cy.js" --browser chromium --e2e --config video=false --headed --no-exit
                '''
            }
        }
    }

    post {
        always {
            script {
                echo "CLEANUP STAGE: Always runs after pipeline."
            }

            script {
                echo "Uploading results to Allure and generating report."
                def allureResultsHostPath = "${ACTUAL_JENKINS_HOST_WORKSPACE_PATH}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/allure-results"
                def allureZipPath = "/tmp/allure-results.zip"

                sh """
                    if [ -d "${allureResultsHostPath}" ] && [ "\$(ls -A ${allureResultsHostPath})" ]; then
                        echo "Allure results found. Zipping them up."
                        zip -j ${allureZipPath} ${allureResultsHostPath}/*
                    else
                        echo "No Allure results found. Creating empty zip."
                        touch /tmp/dummy_empty_file_for_zip
                        zip -j ${allureZipPath} /tmp/dummy_empty_file_for_zip
                        rm /tmp/dummy_empty_file_for_zip
                    fi
                """

                sh """
                    curl -sf -X POST ${ALLURE_DOCKER_SERVICE_URL}/allure-docker-service/projects \
                      -H 'Content-Type: application/json' \
                      -d '{"id": "${ALLURE_PROJECT_ID}", "name": "${ALLURE_PROJECT_ID} Smoke Tests"}' || true
                """

                sh """
                    curl -sf -X POST "${ALLURE_DOCKER_SERVICE_URL}/allure-docker-service/send-results?project_id=${ALLURE_PROJECT_ID}" \
                      -F "results=@${allureZipPath}" || true
                """

                sh """
                    curl -sf -X POST "${ALLURE_DOCKER_SERVICE_URL}/allure-docker-service/generate-report?project_id=${ALLURE_PROJECT_ID}" \
                      -H 'Content-Type: application/json' \
                      -d '{
                          "reportName": "${REPORT_NAME}",
                          "buildName": "Build #${BUILD_NUMBER}",
                          "buildOrder": "${BUILD_NUMBER}"
                        }' || true
                """

                echo "Allure Report: ${ALLURE_DOCKER_SERVICE_URL}/projects/${ALLURE_PROJECT_ID}/reports/latest/index.html"
            }
            archiveArtifacts artifacts: "${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/cypress/videos/**, ${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/cypress/screenshots/**", fingerprint: true, allowEmptyArchive: true
        }
    }
}
