pipeline {
    agent any

    environment {
        VERCEL_ORG_ID = 'your-vercel-org-id'
        VERCEL_PROJECT_ID = 'your-vercel-project-id'
    }

    tools {
        nodejs 'node20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Install Vercel CLI') {
            steps {
                bat 'npm install -g vercel'
            }
        }

        stage('Deploy to Vercel') {
            steps {
                withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
                    bat 'vercel pull --yes --environment=production --token %VERCEL_TOKEN%'
                    bat 'vercel build --prod --token %VERCEL_TOKEN%'
                    bat 'vercel deploy --prebuilt --prod --token %VERCEL_TOKEN%'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment to Vercel completed successfully.'
        }
        failure {
            echo 'Deployment failed. Check the Jenkins console output for details.'
        }
    }
}
