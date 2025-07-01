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
    }

    stages {
        stage('Declarative: Checkout SCM') {
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
                sh "docker build -t custom-cypress:13.11 ./${CYPRESS_PROJECT_DIR_IN_WORKSPACE}"
            }
        }

        stage('Run Smoke Tests in Dedicated Container') {
            steps {
                sh '''
                  echo "--- Debugging WORKSPACE and Volume Mount ---"
                  echo "Jenkins WORKSPACE is: ${WORKSPACE}"
                  echo "Relative Cypress Project Dir: ${CYPRESS_PROJECT_DIR_IN_WORKSPACE}"
                  echo "Full Host Path for Cypress Project (expected source for mount): ${WORKSPACE}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}"
                  echo "Running Cypress volume mount test..."

                  docker stop jenkins-cypress-debug || true
                  docker rm jenkins-cypress-debug || true

                  docker run --name jenkins-cypress-debug \\
                    --network="$DOCKER_NETWORK" \\
                    -e CYPRESS_BASE_URL="$CYPRESS_BASE_URL" \\
                    -v "${WORKSPACE}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}:${CYPRESS_PROJECT_DIR_IN_CONTAINER}" \\
                    -w "$CYPRESS_PROJECT_DIR_IN_CONTAINER" \\
                    --entrypoint /bin/sh \\
                    custom-cypress:13.11 \\
                    -c "ls -la ${CYPRESS_PROJECT_DIR_IN_CONTAINER}; cat ${CYPRESS_PROJECT_DIR_IN_CONTAINER}/cypress.config.js || echo 'cypress.config.js not found or unreadable'; echo '--- End of Container /app Content ---'"
                '''
            }
        }
    }

    post {
        always {
            script {
                echo "Uploading results to Allure and generating report..."

                def allureResultsHostPath = "${WORKSPACE}/${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/allure-results"
                def allureZipPath = "/tmp/allure-results.zip"

                sh """
                    if [ -d "${allureResultsHostPath}" ] && [ "\$(ls -A ${allureResultsHostPath})" ]; then
                        echo "Allure results found. Zipping them up."
                        zip -j ${allureZipPath} ${allureResultsHostPath}/*
                    else
                        echo "No Allure results found in ${allureResultsHostPath}. Creating empty zip."
                        touch /tmp/dummy_empty_file_for_zip
                        zip -j ${allureZipPath} /tmp/dummy_empty_file_for_zip
                        rm /tmp/dummy_empty_file_for_zip
                    fi
                """

                sh """
                    curl -sf -X POST ${ALLURE_DOCKER_SERVICE_URL}/allure-docker-service/projects \\
                      -H 'Content-Type: application/json' \\
                      -d '{"id": "${ALLURE_PROJECT_ID}", "name": "${ALLURE_PROJECT_ID} Smoke Tests"}' || true
                """

                sh """
                    curl -sf -X POST "${ALLURE_DOCKER_SERVICE_URL}/allure-docker-service/send-results?project_id=${ALLURE_PROJECT_ID}" \\
                      -F "results=@${allureZipPath}" || true
                """

                sh """
                    curl -sf -X POST "${ALLURE_DOCKER_SERVICE_URL}/allure-docker-service/generate-report?project_id=${ALLURE_PROJECT_ID}" \\
                      -H 'Content-Type: application/json' \\
                      -d '{
                          "reportName": "${REPORT_NAME}",
                          "buildName": "Build #${BUILD_NUMBER}",
                          "buildOrder": "${BUILD_NUMBER}"
                        }' || true
                """

                echo "Allure Report: ${ALLURE_DOCKER_SERVICE_URL}/projects/${ALLURE_PROJECT_ID}/reports/latest/index.html"
            }
            archiveArtifacts artifacts: "${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/cypress/videos/**, ${CYPRESS_PROJECT_DIR_IN_WORKSPACE}/cypress/screenshots/**", fingerprint: true, allowEmptyArchive: true
            sh "docker stop jenkins-cypress-debug || true"
            sh "docker rm jenkins-cypress-debug || true"
        }
    }
}