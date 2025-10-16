# CoreComply Documentation Site - Terraform Infrastructure

This Terraform configuration deploys the Azure infrastructure for hosting CoreComply's MkDocs documentation site with CDN delivery.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Azure Front Door                   │
│              (CDN with SSL/TLS)                     │
│         https://docs.corecomply.com.au              │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│           Azure Storage Account                     │
│            (Static Website)                         │
│         Primary: Australia East                     │
│         Replication: LRS/GRS                        │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│          $web Container (Blob)                      │
│                                                     │
│  ├── index.html                                    │
│  ├── 404.html                                      │
│  ├── assets/                                       │
│  ├── css/                                          │
│  └── js/                                           │
└─────────────────────────────────────────────────────┘
```

## Resources Deployed

1. **Resource Group** - Container for all documentation resources
2. **Storage Account** - Static website hosting with versioning
3. **Azure CDN (Front Door Standard)** - Global content delivery
4. **Log Analytics Workspace** - Monitoring and diagnostics (optional)
5. **Diagnostic Settings** - Resource logging
6. **Lifecycle Policies** - Blob tier management
7. **Custom Domain** - SSL/TLS certificate (optional)

## Prerequisites

### Required Tools
- [Terraform](https://www.terraform.io/downloads) >= 1.6.0
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) >= 2.50.0
- Access to Azure subscription with Contributor role

### Required Azure Permissions
- `Microsoft.Resources/resourceGroups/*`
- `Microsoft.Storage/storageAccounts/*`
- `Microsoft.Cdn/profiles/*`
- `Microsoft.OperationalInsights/workspaces/*` (if monitoring enabled)

### Azure CLI Login
```bash
# Login to Azure
az login

# Set subscription (if you have multiple)
az account set --subscription "CoreComply-Production"

# Verify current subscription
az account show --output table
```

## Backend Configuration

### Step 1: Create Terraform State Storage (One-time setup)

```bash
# Set variables
LOCATION="australiaeast"
RG_NAME="rg-terraform-state"
STORAGE_NAME="stcorecomplytfstate"
CONTAINER_NAME="tfstate"

# Create resource group
az group create \
  --name $RG_NAME \
  --location $LOCATION

# Create storage account
az storage account create \
  --name $STORAGE_NAME \
  --resource-group $RG_NAME \
  --location $LOCATION \
  --sku Standard_LRS \
  --encryption-services blob \
  --min-tls-version TLS1_2

# Create blob container
az storage container create \
  --name $CONTAINER_NAME \
  --account-name $STORAGE_NAME \
  --auth-mode login

# Enable versioning
az storage account blob-service-properties update \
  --account-name $STORAGE_NAME \
  --enable-versioning true
```

### Step 2: Configure Backend in Terraform

The backend is configured in `main.tf` but requires initialization parameters:

```bash
terraform init \
  -backend-config="resource_group_name=rg-terraform-state" \
  -backend-config="storage_account_name=stcorecomplytfstate" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=docs-site.tfstate"
```

## Variable Configuration

### Option 1: Using terraform.tfvars (Recommended)

Create `terraform.tfvars` file:

```hcl
# Core Configuration
project_name = "corecomply"
environment  = "prod"
location     = "australiaeast"

# Storage Configuration
storage_replication_type = "GRS"
blob_retention_days      = 7
version_retention_days   = 30
enable_lifecycle_management = true

# CDN Configuration
cdn_sku           = "Standard_AzureFrontDoor"
cdn_custom_domain = "docs.corecomply.com.au"

# Security
enable_public_access = true
allowed_ip_ranges    = []

# Monitoring
enable_monitoring  = true
log_retention_days = 90

# Tags
tags = {
  CostCenter = "Engineering"
  Owner      = "DevOps Team"
  Compliance = "APGF"
}
```

### Option 2: Using Environment-Specific .tfvars

```bash
# For production
terraform apply -var-file="environments/prod.tfvars"

# For staging
terraform apply -var-file="environments/staging.tfvars"

# For dev
terraform apply -var-file="environments/dev.tfvars"
```

Example `environments/prod.tfvars`:
```hcl
project_name             = "corecomply"
environment              = "prod"
location                 = "australiaeast"
storage_replication_type = "GRS"
cdn_sku                  = "Standard_AzureFrontDoor"
cdn_custom_domain        = "docs.corecomply.com.au"
enable_monitoring        = true
log_retention_days       = 90
```

### Option 3: Using Command-Line Variables

```bash
terraform apply \
  -var="project_name=corecomply" \
  -var="environment=prod" \
  -var="location=australiaeast" \
  -var="cdn_custom_domain=docs.corecomply.com.au"
```

## Deployment Instructions

### Step 1: Initialize Terraform

```bash
cd infra/terraform/docs-site

terraform init \
  -backend-config="resource_group_name=rg-terraform-state" \
  -backend-config="storage_account_name=stcorecomplytfstate" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=docs-site.tfstate"
```

### Step 2: Validate Configuration

```bash
# Validate syntax
terraform validate

# Format code
terraform fmt -recursive

# Check configuration
terraform plan -var-file="environments/prod.tfvars"
```

### Step 3: Review Execution Plan

```bash
terraform plan \
  -var-file="environments/prod.tfvars" \
  -out=tfplan

# Review plan output
terraform show tfplan
```

### Step 4: Apply Configuration

```bash
# Apply with approval prompt
terraform apply -var-file="environments/prod.tfvars"

# Or apply saved plan
terraform apply tfplan
```

### Step 5: Retrieve Outputs

```bash
# View all outputs
terraform output

# View specific output
terraform output documentation_site_url
terraform output cdn_endpoint_url
terraform output storage_account_name

# Export outputs to JSON
terraform output -json > outputs.json
```

## Custom Domain Setup

### Step 1: Configure DNS Records

After deployment, configure DNS records at your DNS provider:

```bash
# Get DNS validation info
terraform output dns_validation_records
```

Add these records to your DNS:

```
Type: CNAME
Name: docs.corecomply.com.au
Value: <cdn_endpoint_hostname>
TTL: 3600

Type: TXT
Name: _dnsauth.docs.corecomply.com.au
Value: <validation_token>
TTL: 3600
```

### Step 2: Verify Domain Validation

```bash
# Check DNS propagation
nslookup docs.corecomply.com.au

# Verify TXT record
nslookup -type=TXT _dnsauth.docs.corecomply.com.au

# Test HTTPS endpoint (after validation)
curl -I https://docs.corecomply.com.au
```

## Azure DevOps Pipeline Integration

### Pipeline Variables

Export Terraform outputs as pipeline variables:

```yaml
# In azure-pipelines.docs.yml
variables:
  - name: RESOURCE_GROUP
    value: $(terraform output -raw resource_group_name)
  - name: STORAGE_ACCOUNT
    value: $(terraform output -raw storage_account_name)
  - name: CDN_PROFILE
    value: $(terraform output -raw cdn_profile_name)
  - name: CDN_ENDPOINT
    value: $(terraform output -raw cdn_endpoint_name)
```

### Automated Deployment

The infrastructure is deployed via `.ado/azure-pipelines.docs.yml`:

1. **Trigger:** Push to `main` branch with changes in `docs/` or `mkdocs.yml`
2. **Build:** MkDocs site build
3. **Terraform:** Plan and apply infrastructure
4. **Deploy:** Upload to Azure Storage
5. **CDN:** Purge cache

## Cost Estimation

### Monthly Cost Breakdown (USD)

| Resource | Configuration | Estimated Cost |
|----------|--------------|----------------|
| **Storage Account** | Standard LRS, 10GB | $5/month |
| **Storage Account** | Standard GRS, 10GB | $10/month |
| **CDN (Front Door)** | Standard, 1TB transfer | $35/month |
| **CDN (Front Door)** | Premium, 1TB transfer | $350/month |
| **Log Analytics** | 5GB ingestion | $5/month |
| **Total (Standard LRS)** | - | **$45/month** |
| **Total (Standard GRS)** | - | **$50/month** |

**Notes:**
- Costs assume 10GB storage, 1TB CDN egress
- Custom domain SSL certificate is free (managed certificate)
- Actual costs may vary based on usage
- Monitor costs in Azure Cost Management

### Cost Optimization Tips

1. **Use LRS for non-production** - 50% cheaper than GRS
2. **Lifecycle policies** - Auto-tier old assets to Cool/Archive
3. **CDN caching** - Reduce origin requests
4. **Compression** - Reduce bandwidth costs
5. **Disable monitoring in dev** - Save $5/month per environment

## Monitoring & Diagnostics

### View Logs in Azure Portal

```bash
# Get Log Analytics workspace ID
terraform output log_analytics_workspace_id

# Query logs using Azure CLI
az monitor log-analytics query \
  --workspace "<workspace_id>" \
  --analytics-query "StorageFileLogs | where TimeGenerated > ago(1h)"
```

### Common Queries

**CDN Access Logs:**
```kusto
FrontDoorAccessLog
| where TimeGenerated > ago(1h)
| summarize count() by httpStatusCode_s, requestUri_s
| order by count_ desc
```

**Storage Read Operations:**
```kusto
StorageBlobLogs
| where OperationName == "GetBlob"
| where TimeGenerated > ago(1h)
| summarize count() by Uri
| order by count_ desc
```

## Troubleshooting

### Issue: Terraform Init Fails

```bash
# Error: Failed to get existing workspaces
# Solution: Ensure backend storage account exists
az storage account show \
  --name stcorecomplytfstate \
  --resource-group rg-terraform-state
```

### Issue: Storage Account Name Conflict

```bash
# Error: Storage account name already taken
# Solution: Modify project_name or environment variables
terraform plan -var="project_name=corecomply2"
```

### Issue: Custom Domain Validation Fails

```bash
# Check DNS records
nslookup -type=CNAME docs.corecomply.com.au
nslookup -type=TXT _dnsauth.docs.corecomply.com.au

# Verify in Azure
az cdn custom-domain show \
  --resource-group $(terraform output -raw resource_group_name) \
  --profile-name $(terraform output -raw cdn_profile_name) \
  --custom-domain-name docs-corecomply-com-au
```

### Issue: CDN Not Serving Latest Content

```bash
# Purge CDN cache
az cdn endpoint purge \
  --resource-group $(terraform output -raw resource_group_name) \
  --profile-name $(terraform output -raw cdn_profile_name) \
  --name $(terraform output -raw cdn_endpoint_name) \
  --content-paths '/*'

# Verify cache status
curl -I https://docs.corecomply.com.au | grep -i cache
```

## Maintenance

### Update Infrastructure

```bash
# Pull latest changes
git pull origin main

# Review changes
terraform plan -var-file="environments/prod.tfvars"

# Apply updates
terraform apply -var-file="environments/prod.tfvars"
```

### Destroy Infrastructure

```bash
# Preview destruction
terraform plan -destroy -var-file="environments/prod.tfvars"

# Destroy (requires confirmation)
terraform destroy -var-file="environments/prod.tfvars"
```

### State Management

```bash
# List state resources
terraform state list

# Show specific resource
terraform state show azurerm_storage_account.docs

# Move resource (if refactoring)
terraform state mv azurerm_storage_account.docs azurerm_storage_account.docs_new

# Import existing resource
terraform import azurerm_storage_account.docs /subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.Storage/storageAccounts/{name}
```

## Security Best Practices

1. **State File Security**
   - Store in Azure Blob with encryption
   - Enable versioning for rollback
   - Restrict access with RBAC

2. **Storage Account Security**
   - Enable HTTPS-only traffic
   - Use Managed Identity for pipeline access
   - Configure network rules for IP restrictions

3. **CDN Security**
   - Enforce HTTPS redirect
   - Use managed SSL certificates
   - Enable WAF (Premium SKU)

4. **Secrets Management**
   - Store sensitive outputs in Azure Key Vault
   - Use service principal for automation
   - Rotate credentials regularly

## Support

- **Documentation:** [Azure Front Door](https://learn.microsoft.com/en-us/azure/frontdoor/)
- **Terraform Provider:** [azurerm](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- **Internal Support:** #devops-support Slack channel
- **On-call:** DevOps Lead (escalation only)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Sep 2025 | Initial Terraform configuration |
| 1.1 | Nov 2025 | Added custom domain support |
| 1.2 | Dec 2025 | Added monitoring and diagnostics |

---

**Last Updated:** September 2025  
**Maintained By:** CoreComply DevOps Team  
**Review Cycle:** Quarterly
