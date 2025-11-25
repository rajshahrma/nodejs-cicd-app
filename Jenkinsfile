pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-20'  // Must match NodeJS tool name in Jenkins
    }
    
    environment {
        APP_NAME = 'nodejs-cicd-app'
        PRODUCTION_SERVER = 'ubuntu@172.31.3.156'  // REPLACE THIS
        DEPLOY_PATH = '/var/www/nodejs-app/current'
        APP_VERSION = "1.${BUILD_NUMBER}"
        NODE_ENV = 'production'
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "=========================================="
                    echo "Stage 1: Code Checkout"
                    echo "=========================================="
                }
                checkout scm
                sh 'git rev-parse --short HEAD > commit-id.txt'
                script {
                    env.GIT_COMMIT_SHORT = readFile('commit-id.txt').trim()
                    echo "Git Commit: ${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    echo "=========================================="
                    echo "Stage 2: Installing Dependencies"
                    echo "=========================================="
                }
                sh '''
                    npm --version
                    node --version
                    npm ci
                    echo "Dependencies installed successfully"
                '''
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    echo "=========================================="
                    echo "Stage 3: Running Tests"
                    echo "=========================================="
                }
                sh '''
                    npm test
                    echo "All tests passed successfully"
                '''
            }
        }
        
        stage('Code Quality Check') {
            steps {
                script {
                    echo "=========================================="
                    echo "Stage 4: Code Quality Analysis"
                    echo "=========================================="
                }
                sh '''
                    echo "Checking code structure..."
                    find . -name "*.js" -not -path "./node_modules/*" | wc -l
                    echo "JavaScript files found"
                    
                    echo "Checking for potential issues..."
                    # Basic checks
                    if grep -r "console.log" --include="*.js" --exclude-dir=node_modules .; then
                        echo "Warning: console.log statements found"
                    else
                        echo "No console.log statements found"
                    fi
                '''
            }
        }
        
        stage('Build') {
            steps {
                script {
                    echo "=========================================="
                    echo "Stage 5: Build Application"
                    echo "=========================================="
                }
                sh '''
                    echo "Creating deployment package..."
                    echo "Build Number: ${BUILD_NUMBER}"
                    echo "App Version: ${APP_VERSION}"
                    echo "Git Commit: ${GIT_COMMIT_SHORT}"
                    
                    # Create deployment directory
                    mkdir -p deployment
                    
                    # Copy necessary files
                    cp -r server.js package.json package-lock.json deployment/
                    
                    # Copy deployment script
                    if [ -f deploy.sh ]; then
                        cp deploy.sh deployment/
                        chmod +x deployment/deploy.sh
                    fi
                    
                    echo "Build completed successfully"
                '''
            }
        }
        
        stage('Pre-deployment Check') {
            steps {
                script {
                    echo "=========================================="
                    echo "Stage 6: Pre-deployment Verification"
                    echo "=========================================="
                }
                sshagent(['production-server-ssh']) {
                    sh '''
                        echo "Checking connection to production server..."
                        ssh -o StrictHostKeyChecking=no ${PRODUCTION_SERVER} "echo 'Connection successful'"
                        
                        echo "Checking disk space on production server..."
                        ssh ${PRODUCTION_SERVER} "df -h /var/www"
                        
                        echo "Checking if Node.js is installed..."
                        ssh ${PRODUCTION_SERVER} "node --version"
                        
                        echo "Checking if PM2 is installed..."
                        ssh ${PRODUCTION_SERVER} "pm2 --version"
                        
                        echo "Pre-deployment checks passed"
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            steps {
                script {
                    echo "=========================================="
                    echo "Stage 7: Deploying to Production"
                    echo "=========================================="
                }
                sshagent(['production-server-ssh']) {
                    sh '''
                        echo "Creating deployment directory on server..."
                        ssh ${PRODUCTION_SERVER} "mkdir -p ${DEPLOY_PATH}"
                        
                        echo "Transferring application files..."
                        scp -o StrictHostKeyChecking=no -r deployment/* ${PRODUCTION_SERVER}:${DEPLOY_PATH}/
                        
                        echo "Setting environment variables..."
                        ssh ${PRODUCTION_SERVER} "export APP_VERSION=${APP_VERSION} && export BUILD_NUMBER=${BUILD_NUMBER}"
                        
                        echo "Running deployment script..."
                        ssh ${PRODUCTION_SERVER} "cd ${DEPLOY_PATH} && bash deploy.sh"
                        
                        echo "Deployment completed successfully"
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "=========================================="
                    echo "Stage 8: Post-deployment Health Check"
                    echo "=========================================="
                }
                sleep(time: 5, unit: 'SECONDS')  // Wait for app to start
                sshagent(['production-server-ssh']) {
                    sh '''
                        echo "Checking application status..."
                        ssh ${PRODUCTION_SERVER} "pm2 list"
                        
                        echo "Testing health endpoint..."
                        HEALTH_CHECK=$(ssh ${PRODUCTION_SERVER} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health")
                        
                        if [ "$HEALTH_CHECK" = "200" ]; then
                            echo "✅ Health check passed! Application is running."
                        else
                            echo "❌ Health check failed! HTTP Status: $HEALTH_CHECK"
                            exit 1
                        fi
                        
                        echo "Fetching application info..."
                        ssh ${PRODUCTION_SERVER} "curl -s http://localhost:3000/api/info | python3 -m json.tool"
                    '''
                }
            }
        }
        
        stage('Smoke Tests') {
            steps {
                script {
                    echo "=========================================="
                    echo "Stage 9: Running Smoke Tests"
                    echo "=========================================="
                }
                sshagent(['production-server-ssh']) {
                    sh '''
                        echo "Testing application endpoints..."
                        
                        # Test home page
                        HOME_STATUS=$(ssh ${PRODUCTION_SERVER} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/")
                        echo "Home page status: $HOME_STATUS"
                        
                        # Test API endpoint
                        API_STATUS=$(ssh ${PRODUCTION_SERVER} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/info")
                        echo "API endpoint status: $API_STATUS"
                        
                        # Verify all tests passed
                        if [ "$HOME_STATUS" = "200" ] && [ "$API_STATUS" = "200" ]; then
                            echo "✅ All smoke tests passed!"
                        else
                            echo "❌ Smoke tests failed!"
                            exit 1
                        fi
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo "=========================================="
            echo "🎉 Pipeline Completed Successfully!"
            echo "=========================================="
            echo "Application Version: ${APP_VERSION}"
            echo "Build Number: ${BUILD_NUMBER}"
            echo "Git Commit: ${GIT_COMMIT_SHORT}"
            echo "Deployment Status: SUCCESS ✅"
            echo "=========================================="
        }
        
        failure {
            echo "=========================================="
            echo "❌ Pipeline Failed!"
            echo "=========================================="
            echo "Build Number: ${BUILD_NUMBER}"
            echo "Checking logs for errors..."
            echo "=========================================="
            
            // Attempt to rollback on failure
            script {
                sshagent(['production-server-ssh']) {
                    sh '''
                        echo "Attempting rollback to previous version..."
                        ssh ${PRODUCTION_SERVER} "cd /var/www/nodejs-app && ls -t backup_* | head -1" || echo "No backup available"
                    '''
                }
            }
        }
        
        always {
            echo "=========================================="
            echo "Cleaning up workspace..."
            echo "=========================================="
            cleanWs()
        }
    }
}
