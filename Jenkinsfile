pipeline {
    agent any
    environment {
        VERCEL_TOKEN = credentials('vercel-token')
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Check Node and NPM') {
            steps {
                bat 'node -v'
                bat 'npm -v'
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
                bat 'vercel pull --yes --environment=production --token %VERCEL_TOKEN%'
                bat 'vercel build --prod --token %VERCEL_TOKEN%'
                bat 'vercel deploy --prebuilt --prod --token %VERCEL_TOKEN%'
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
