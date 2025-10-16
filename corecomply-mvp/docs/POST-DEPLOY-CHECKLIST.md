# Post-Deployment Checklist

## Infrastructure Verification

### ✅ Resource Group
- [ ] Resource group created in correct region (australiaeast)
- [ ] All resources deployed successfully
- [ ] Tags applied correctly (project, env)

### ✅ SQL Database
- [ ] SQL Server created and accessible
- [ ] Database created with correct SKU (S0)
- [ ] Firewall rule allows Azure services
- [ ] Connection string configured in API App Settings
- [ ] Database migrations applied (check API logs)

### ✅ Storage Account
- [ ] Storage account created
- [ ] Static website enabled ($web container)
- [ ] Evidence container created (private access)
- [ ] Managed Identity has Storage Blob Data Contributor role

### ✅ App Service (API)
- [ ] App Service plan created (B1 Linux)
- [ ] App Service deployed with .NET 8 runtime
- [ ] System-assigned Managed Identity enabled
- [ ] App Settings configured:
  - [ ] ASPNETCORE_ENVIRONMENT=Production
  - [ ] ApplicationInsights__ConnectionString
  - [ ] AzureAd__TenantId
  - [ ] AzureAd__ClientId
  - [ ] ConnectionStrings__Sql
  - [ ] Storage__AccountName
  - [ ] Storage__Container
- [ ] App Service authentication configured
- [ ] Health endpoint responding: `/swagger/index.html`

### ✅ CDN
- [ ] CDN profile created
- [ ] CDN endpoint created
- [ ] Origin configured to static website
- [ ] HTTPS enabled, HTTP disabled
- [ ] Custom domain configured (if applicable)

### ✅ Key Vault
- [ ] Key Vault created
- [ ] Soft delete enabled (7 days)
- [ ] Access policy configured for service principal
- [ ] Managed Identity has access

### ✅ Application Insights
- [ ] Application Insights created
- [ ] Instrumentation key available
- [ ] Connected to API App Service
- [ ] Telemetry flowing (check Live Metrics)

## Application Verification

### ✅ Web Application
- [ ] Web app accessible via CDN endpoint
- [ ] Static files loading correctly
- [ ] Login page displays
- [ ] Microsoft sign-in redirect works
- [ ] After login, dashboard loads
- [ ] All pages accessible (Frameworks, Controls, Policies, Audits)
- [ ] API calls successful (check browser console)

### ✅ API Application
- [ ] Swagger UI accessible at `/swagger`
- [ ] All endpoints documented
- [ ] Authentication required on protected endpoints
- [ ] Test endpoints:
  - [ ] GET /api/frameworks
  - [ ] GET /api/controls
  - [ ] GET /api/policies
  - [ ] GET /api/audits

### ✅ Authentication & Authorization
- [ ] Entra ID app registration configured
- [ ] Redirect URIs correct
- [ ] API scope `access_as_user` created
- [ ] Web app can acquire tokens
- [ ] API validates tokens correctly
- [ ] User claims available in API

### ✅ File Upload (Evidence)
- [ ] Evidence upload endpoint works: POST /api/evidence
- [ ] Files stored in Azure Blob Storage
- [ ] SHA-256 hash calculated correctly
- [ ] Metadata saved in database
- [ ] Managed Identity authentication to storage works

## Security Verification

### ✅ Network Security
- [ ] SQL Database only allows Azure services
- [ ] Storage account has private evidence container
- [ ] Key Vault access restricted to authorized identities
- [ ] CDN uses HTTPS only

### ✅ Identity & Access
- [ ] Managed Identity configured for API App Service
- [ ] Managed Identity has minimum required permissions:
  - [ ] Storage Blob Data Contributor on storage account
  - [ ] Key Vault Secrets User on Key Vault
  - [ ] SQL Database access (AAD authentication)
- [ ] Service Principal permissions reviewed
- [ ] No secrets in application code or configuration

### ✅ Compliance
- [ ] All resources in Australia East region
- [ ] Data residency requirements met
- [ ] Audit logging enabled (Application Insights)
- [ ] Secrets stored in Key Vault (not in code)

## Monitoring & Diagnostics

### ✅ Application Insights
- [ ] Connected to API App Service
- [ ] Telemetry data flowing
- [ ] Custom events/metrics configured
- [ ] Alert rules created:
  - [ ] API response time > 2s
  - [ ] Failed requests > 5%
  - [ ] Database exceptions

### ✅ Logs
- [ ] App Service diagnostic logs enabled
- [ ] Log retention configured (30 days minimum)
- [ ] Logs flowing to Log Analytics workspace (if configured)
- [ ] Database query performance insights enabled

## Testing

### ✅ Functional Testing
- [ ] User can log in successfully
- [ ] Dashboard displays statistics
- [ ] Frameworks page loads data
- [ ] Controls page loads data
- [ ] Policies page loads data
- [ ] Audits page loads data
- [ ] Evidence upload works (if control exists)

### ✅ Performance Testing
- [ ] API response times < 500ms for list operations
- [ ] Web app loads in < 3 seconds
- [ ] CDN serving static files efficiently
- [ ] Database queries optimized (check query performance)

### ✅ Security Testing
- [ ] Unauthenticated requests rejected (401)
- [ ] Invalid tokens rejected
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified (React handles this)
- [ ] CORS configured correctly

## Documentation

- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Architecture diagrams created
- [ ] API documentation available (Swagger)
- [ ] Troubleshooting guide created
- [ ] Runbook for common operations

## Backup & Disaster Recovery

- [ ] Database backup configured (Azure SQL automatic backups)
- [ ] Point-in-time restore tested
- [ ] Terraform state backed up
- [ ] Storage account backup/replication configured
- [ ] Disaster recovery plan documented

## Production Readiness

- [ ] All checklist items completed
- [ ] Stakeholders notified
- [ ] Support team trained
- [ ] Monitoring dashboards configured
- [ ] Incident response plan in place
- [ ] Change management process defined

## Sign-off

- [ ] Technical Lead: _________________ Date: _______
- [ ] Security Officer: _________________ Date: _______
- [ ] Operations Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______

---

## Quick Health Check Commands

```bash
# Check API health
curl https://<api-app-name>.azurewebsites.net/swagger/index.html

# Check web app
curl https://<cdn-endpoint>.azureedge.net

# Check database
az sql db show --name <db-name> --server <server-name> --resource-group <rg-name>

# Check storage
az storage account show --name <storage-name> --resource-group <rg-name>

# View API logs
az webapp log tail --name <api-app-name> --resource-group <rg-name>
```
