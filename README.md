# Node.js CI/CD Application

This is a sample Node.js application demonstrating a complete CI/CD pipeline using Jenkins.

## Features

- Express.js web server
- Automated testing with Jest
- Health check endpoints
- Zero-downtime deployment with PM2
- Automated CI/CD pipeline

## Local Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## Production Deployment

Automatically deployed via Jenkins pipeline on push to main branch.

## Endpoints

- `/` - Home page
- `/health` - Health check
- `/api/info` - Application information
