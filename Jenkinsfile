pipeline {
    agent any

    environment {
        VERCEL_TOKEN = 'your_vercel_token_here'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                bat 'npm install'
                bat 'npm install -g vercel'
            }
        }

        stage('Deploy') {
            steps {
                bat 'vercel --prod --token %VERCEL_TOKEN% --yes'
            }
        }
    }
}

