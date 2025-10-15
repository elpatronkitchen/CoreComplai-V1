# CoreComply MVP Deployment Guide

## Prerequisites

- Azure subscription with Owner or Contributor access
- Azure CLI installed and configured
- Terraform >= 1.7.0 installed
- Azure DevOps organization with project created
- Service Connection configured in Azure DevOps

## 1. Terraform Backend Setup

First, create the storage account for Terraform state:

```bash
# Set variables
LOCATION="australiaeast"
RG_NAME="corecomply-tfstate-rg"
STORAGE_NAME="corecomplystate$(date +%s)"
CONTAINER_NAME="tfstate"

# Create resource group
az group create --name $RG_NAME --location $LOCATION

# Create storage account
az storage account create \
  --name $STORAGE_NAME \
  --resource-group $RG_NAME \
  --location $LOCATION \
  --sku Standard_LRS

# Create container
az storage container create \
  --name $CONTAINER_NAME \
  --account-name $STORAGE_NAME
```

## 2. Azure DevOps Variable Groups

Create a variable group named `corecomply-infra-vars` with:

- `ARM_SERVICE_CONNECTION`: Your Azure service connection name
- `TF_STATE_RG`: Resource group for Terraform state
- `TF_STATE_STORAGE`: Storage account name for Terraform state
- `TF_STATE_CONTAINER`: Container name (default: tfstate)
- `SQL_ADMIN_LOGIN`: SQL Server admin username
- `SQL_ADMIN_PASSWORD`: SQL Server admin password (secret)
- `AAD_TENANT_ID`: Your Entra ID tenant ID
- `AAD_CLIENT_ID`: Your app registration client ID
- `API_APP_NAME`: Name of the API App Service
- `STORAGE_ACCOUNT_NAME`: Name of the storage account
- `RESOURCE_GROUP_NAME`: Name of the resource group
- `CDN_PROFILE_NAME`: Name of the CDN profile
- `CDN_ENDPOINT_NAME`: Name of the CDN endpoint
- `API_BASE_URL`: Full URL to the API

## 3. Terraform Variables

Create a `terraform.tfvars` file in `infra/terraform/`:

```hcl
project                 = "corecomply"
location                = "australiaeast"
env                     = "prod"
tf_state_rg             = "<your-tfstate-rg>"
tf_state_storage        = "<your-tfstate-storage>"
tf_state_container      = "tfstate"
sql_admin_login         = "<your-sql-admin>"
sql_admin_password      = "<your-sql-password>"
aad_tenant_id           = "<your-tenant-id>"
aad_api_client_id       = "<your-api-app-client-id>"
aad_web_client_id       = "<your-web-app-client-id>"
sql_aad_admin_object_id = "<your-aad-admin-object-id>"
sql_aad_admin_login     = "<your-aad-admin-upn-or-group>"
```

## 4. Infrastructure Deployment

### Option A: Azure DevOps Pipeline

1. Create pipeline from `infra-deploy-pipeline.yml`
2. Configure variable group permissions
3. Run the pipeline

### Option B: Manual Deployment

```bash
cd infra/terraform

# Initialize
terraform init \
  -backend-config="resource_group_name=<tfstate-rg>" \
  -backend-config="storage_account_name=<tfstate-storage>" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=corecomply/infra.tfstate"

# Plan
terraform plan -out=tfplan

# Apply
terraform apply tfplan
```

## 5. Configure SQL Managed Identity Access

After infrastructure deployment, grant the API Managed Identity access to SQL:

1. Connect to the SQL Database using Azure AD authentication as the AAD Administrator
2. Run the post-deployment SQL script:

```bash
# Get the API App Service name
API_NAME=$(terraform -chdir=infra/terraform output -raw api_base_url | cut -d'.' -f1)

# Update the SQL script with the correct name
sed -i "s/corecomply-prod-api/$API_NAME/g" infra/terraform/post-deploy-sql-setup.sql

# Execute the script (requires Azure CLI and SQL AAD admin privileges)
az sql db query \
  --server <sql-server-name> \
  --database <database-name> \
  --auth-type ActiveDirectoryIntegrated \
  --file infra/terraform/post-deploy-sql-setup.sql
```

Or manually via Azure Portal SQL Query Editor:
1. Navigate to SQL Database > Query editor
2. Sign in with Azure AD
3. Run the script from `infra/terraform/post-deploy-sql-setup.sql`

## 6. API Deployment

### Configure App Service

The Managed Identity and RBAC are configured via Terraform. Verify:

1. Navigate to App Service in Azure Portal
2. Confirm Managed Identity (System-assigned) is enabled
3. Verify RBAC assignments:
   - Storage Account (Storage Blob Data Contributor)
   - SQL Database (db_datareader + db_datawriter via contained user)

### Deploy API

1. Create pipeline from `api-deploy-pipeline.yml`
2. Run the pipeline

## 6. Web Deployment

### Configure Environment Variables

Update Azure DevOps variable group with:

- `AAD_CLIENT_ID`: Your app registration client ID
- `AAD_TENANT_ID`: Your tenant ID
- `API_BASE_URL`: Your API base URL (from Terraform output)

### Deploy Web

1. Create pipeline from `web-deploy-pipeline.yml`
2. Run the pipeline

## 7. Post-Deployment

Follow the [POST-DEPLOY-CHECKLIST.md](POST-DEPLOY-CHECKLIST.md) to verify deployment.

## Troubleshooting

### Terraform State Lock

If state is locked:

```bash
az storage blob lease break \
  --account-name <storage-account> \
  --container-name tfstate \
  --blob-name corecomply/infra.tfstate
```

### API Not Starting

Check App Service logs:

```bash
az webapp log tail --name <api-app-name> --resource-group <rg-name>
```

### Database Connection Issues

Verify:
1. SQL firewall rules allow Azure services
2. Connection string is correct in App Settings
3. Managed Identity has SQL database permissions
