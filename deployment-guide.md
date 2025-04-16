# Digital Ocean Deployment Guide

This guide explains how to set up automated deployments to Digital Ocean using GitHub Actions.

## Prerequisites

1. A Digital Ocean account
2. A Digital Ocean container registry
3. Either a Digital Ocean App Platform application or a Kubernetes cluster
4. GitHub repository with your code

## Setup Steps

### 1. Create Digital Ocean Resources

#### Container Registry
1. Navigate to "Container Registry" in your Digital Ocean dashboard
2. Click "Create Registry"
3. Choose a name and region for your registry
4. Note down the registry name (e.g., `your-team-name`)

#### App Platform (Option 1)
1. Navigate to "Apps" in your Digital Ocean dashboard
2. Click "Create App"
3. Follow the wizard to set up your app
4. Note down the App ID (available in the URL when viewing the app)

#### Kubernetes (Option 2)
1. Navigate to "Kubernetes" in your Digital Ocean dashboard
2. Create a new cluster or use an existing one
3. Note down the cluster ID

### 2. Create an API Token

1. Navigate to "API" in your Digital Ocean dashboard
2. Generate a new personal access token with read and write permissions
3. Save this token securely - you will need it for GitHub

### 3. Set up GitHub Secrets

In your GitHub repository:

1. Go to Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `DIGITALOCEAN_ACCESS_TOKEN`: Your Digital Ocean API token
   - `DIGITALOCEAN_REGISTRY_NAME`: Your container registry name
   - `DIGITALOCEAN_APP_ID`: (If using App Platform) Your Digital Ocean App ID
   - `DIGITALOCEAN_CLUSTER_ID`: (If using Kubernetes) Your Digital Ocean Kubernetes cluster ID

### 4. Database Configuration

Ensure your application is configured to connect to your production database:

1. Create a managed PostgreSQL database in Digital Ocean
2. Set up the connection string as an environment variable in your Digital Ocean App Platform or Kubernetes deployment

## Deploying Your Application

Once the GitHub Action workflow is set up:

1. Push to the `main` branch to trigger automatic deployment 
   - The image will be tagged with `dev-[commit-sha]` and `latest`
2. Create and push a Git tag like `v1.2.3` to deploy a versioned release
   - The image will be tagged with the version number (e.g., `v1.2.3`), commit SHA, and `latest`
3. Manually trigger the workflow from GitHub Actions > "Deploy to Digital Ocean" > "Run workflow"
   - You can specify a custom version number when manually triggering

### Versioning Strategy

The CI/CD pipeline supports three versioning approaches:

1. **Git tag-based versioning** (recommended for production releases):
   - Create a Git tag following semantic versioning format (`v1.2.3`)
   - Push the tag to trigger a versioned build: `git tag v1.2.3 && git push origin v1.2.3`
   
2. **Manual version specification**:
   - Use the GitHub Actions UI to manually trigger a build with a custom version
   
3. **Automatic development versioning**:
   - Regular pushes to `main` generate images with `dev-[commit-sha]` tags

### Accessing Specific Versions

To use a specific version in your deployment:

```bash
# Pull the latest version
docker pull registry.digitalocean.com/your-registry/tesseract-ocr-service:latest

# Pull a specific versioned release
docker pull registry.digitalocean.com/your-registry/tesseract-ocr-service:v1.2.3

# Pull a specific development build
docker pull registry.digitalocean.com/your-registry/tesseract-ocr-service:dev-abcd1234
```

## Checking Deployment Status

- For App Platform: Check the "Apps" section in your Digital Ocean dashboard
- For Kubernetes: Use `kubectl get pods` to check deployment status after connecting to your cluster
