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
        CYPRESS_CONTAINER_NAME = "jenkins-cypress"
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

        stage('Run Cypress Tests') {
            steps {
                script {
                    // Clean up any old container if it exists
                    sh "docker rm -f ${CYPRESS_CONTAINER_NAME} || true"

                    // Run Cypress in Docker and stream logs directly
                    def exitCode = sh(
                        script: """
                            docker run --rm \
                              --name ${CYPRESS_CONTAINER_NAME} \
                              --network="${DOCKER_NETWORK}" \
                              -e CI=true \
                              -e NO_COLOR=1 \
                              -e CYPRESS_BASE_URL="${CYPRESS_BASE_URL}" \
                              -v "${ACTUAL_JENKINS_HOST_WORKSPACE_PATH}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}:${CYPRESS_PROJECT_DIR_IN_CONTAINER}" \
                              -w "${CYPRESS_PROJECT_DIR_IN_CONTAINER}" \
                              custom-cypress:13.11 \
                              npx cypress run --spec 'smoke/**/*.cy.js' --browser chromium --e2e --config video=false
                        """,
                        returnStatus: true
                    )

                    // Copy allure results (even if tests fail)
                    sh """
                        mkdir -p ${ACTUAL_JENKINS_HOST_WORKSPACE_PATH}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/allure-results || true
                        if [ -d "${ACTUAL_JENKINS_HOST_WORKSPACE_PATH}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/allure-results" ]; then
                          echo "Allure results directory is ready."
                        fi
                    """

                    if (exitCode != 0) {
                        echo "Cypress tests failed. Check logs above for details."
                        currentBuild.result = 'FAILURE'
                    } else {
                        echo "Cypress tests passed successfully."
                    }
                }
            }
        }

        stage('Publish Allure Report') {
            steps {
                script {
                    def allureResultsHostPath = "${ACTUAL_JENKINS_HOST_WORKSPACE_PATH}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/allure-results"
                    def allureZipPath = "/tmp/allure-results.zip"

                    sh """
                        if [ -d "${allureResultsHostPath}" ] && [ "\$(ls -A ${allureResultsHostPath})" ]; then
                            zip -j ${allureZipPath} ${allureResultsHostPath}/*
                        else
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
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: "${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/cypress/videos/**, ${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/cypress/screenshots/**", fingerprint: true, allowEmptyArchive: true

            script {
                echo "If tests failed, you can inspect the Cypress container manually if you remove --rm:"
                echo "  docker exec -it ${CYPRESS_CONTAINER_NAME} sh"
                echo "Or copy allure results manually (if available):"
                echo "  docker cp ${CYPRESS_CONTAINER_NAME}:${CYPRESS_PROJECT_DIR_IN_CONTAINER}/allure-results ./allure-results-debug"
            }
        }
    }
}
