# Azure DevOps Service Connection Setup

## Required Variables

To run the Azure DevOps pipelines, you need to configure the following variables in your Azure DevOps pipeline settings:

### Figma Sync Pipeline Variables

- `FIGMA_TOKEN` - Your Figma personal access token (Secret)
- `FIGMA_FILE_KEY` - The Figma file key from your design file URL (Secret)

### Storybook Pipeline Variables

No additional variables required for Storybook pipeline.

## How to Set Up

1. Navigate to your Azure DevOps project
2. Go to Pipelines → Library → Variable groups
3. Create a new variable group called "CoreComply-Design-System"
4. Add the required variables listed above
5. Mark sensitive variables (FIGMA_TOKEN, FIGMA_FILE_KEY) as Secret
6. Link the variable group to your pipelines

## Getting Figma Credentials

### FIGMA_TOKEN
1. Log in to Figma
2. Go to Settings → Account → Personal Access Tokens
3. Generate a new token with read access
4. Copy the token value

### FIGMA_FILE_KEY
1. Open your Figma design file
2. The file key is in the URL: `https://www.figma.com/file/{FILE_KEY}/...`
3. Copy the file key portion

## Pipeline Schedules

- **Figma Sync**: Runs nightly at 2:00 AM to sync design assets and tokens
- **Storybook Build**: Runs on commits to `main` and `develop` branches
