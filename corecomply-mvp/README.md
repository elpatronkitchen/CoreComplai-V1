# CoreComply MVP - Production Deployment Infrastructure

Complete Azure deployment infrastructure for CoreComply compliance management system, targeting **December 15, 2025 MVP delivery**.

## 🎯 Overview

This repository contains production-ready infrastructure for deploying CoreComply to Azure, including:

- **Terraform Infrastructure as Code** - Complete Azure resource provisioning
- **.NET 8 Web API** - RESTful API with Entity Framework Core
- **React + Vite Web App** - Modern SPA with Microsoft Authentication
- **Azure DevOps CI/CD** - Automated build and deployment pipelines
- **Comprehensive Documentation** - Deployment guides and checklists

## 📋 Table of Contents

- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [Components](#components)
- [Documentation](#documentation)
- [Contributing](#contributing)

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Azure CDN                             │
│              (Global Edge Caching)                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Azure Storage (Static Website)             │
│                  React + Vite SPA                        │
│           (Microsoft Authentication - MSAL)             │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS/JWT
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Azure App Service (Linux)                  │
│                 .NET 8 Web API                          │
│        (Entity Framework Core + Managed Identity)       │
└─────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Azure SQL   │  │Azure Storage │  │  Key Vault   │
│   Database   │  │ (Evidence)   │  │  (Secrets)   │
└──────────────┘  └──────────────┘  └──────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              Application Insights                        │
│           (Monitoring & Diagnostics)                     │
└─────────────────────────────────────────────────────────┘
```

### Key Features

- **Multi-tenant Ready**: Infrastructure supports future multi-tenancy requirements
- **Zero-downtime Deployments**: Blue-green deployment capability via App Service slots
- **Secure by Default**: Managed Identity, Key Vault integration, no secrets in code
- **Australian Data Residency**: All resources deployed to Australia East region
- **Evidence Management**: SHA-256 file hashing with Azure Blob Storage
- **Enterprise Authentication**: Entra ID (Azure AD) integration via MSAL

## 📁 Repository Structure

```
corecomply-mvp/
├── infra/                          # Infrastructure as Code
│   └── terraform/
│       ├── main.tf                 # Root configuration
│       ├── providers.tf            # Azure provider setup
│       ├── variables.tf            # Input variables
│       ├── outputs.tf              # Output values
│       └── modules/                # Terraform modules
│           ├── rg/                 # Resource Group
│           ├── sql/                # Azure SQL Database
│           ├── storage_website/    # Static Website Hosting
│           ├── appservice_api/     # App Service for API
│           ├── key_vault/          # Key Vault
│           ├── app_insights/       # Application Insights
│           └── cdn/                # Azure CDN
│
├── api/                            # .NET 8 Web API
│   └── CoreComply.Api/
│       ├── CoreComply.Api.csproj   # Project file
│       ├── Program.cs              # Application entry point
│       ├── Data/
│       │   └── AppDbContext.cs     # EF Core DbContext
│       ├── Domain/
│       │   └── Entities/           # Domain models
│       ├── Infrastructure/
│       │   └── BlobStorageService.cs
│       └── Controllers/            # API endpoints
│           ├── FrameworksController.cs
│           ├── ControlsController.cs
│           ├── PoliciesController.cs
│           ├── AuditsController.cs
│           └── EvidenceController.cs
│
├── web/                            # React Web Application
│   ├── package.json                # NPM dependencies
│   ├── vite.config.ts              # Vite configuration
│   ├── src/
│   │   ├── main.tsx                # Application entry
│   │   ├── App.tsx                 # Root component
│   │   ├── lib/
│   │   │   ├── auth.ts             # MSAL configuration
│   │   │   └── api.ts              # API client
│   │   ├── components/
│   │   │   └── Layout.tsx          # Main layout
│   │   └── pages/                  # Page components
│   │       ├── Dashboard.tsx
│   │       ├── Frameworks.tsx
│   │       ├── Controls.tsx
│   │       ├── Policies.tsx
│   │       └── Audits.tsx
│   └── .env.example                # Environment template
│
├── .azuredevops/                   # CI/CD Pipelines
│   ├── infra-deploy-pipeline.yml   # Infrastructure deployment
│   ├── api-deploy-pipeline.yml     # API build & deploy
│   └── web-deploy-pipeline.yml     # Web build & deploy
│
└── docs/                           # Documentation
    ├── DEPLOYING.md                # Deployment guide
    ├── ENTRA-ID-SETUP.md          # Authentication setup
    └── POST-DEPLOY-CHECKLIST.md   # Verification checklist
```

## 🛠️ Technology Stack

### Infrastructure
- **Terraform 1.7+** - Infrastructure as Code
- **Azure Resource Manager** - Cloud platform
- **Azure CLI** - Command-line management

### Backend
- **.NET 8** - Runtime framework
- **ASP.NET Core** - Web framework
- **Entity Framework Core 8** - ORM
- **Microsoft.Identity.Web** - Authentication
- **Azure.Storage.Blobs** - File storage
- **Swashbuckle** - API documentation (Swagger)

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **@azure/msal-react** - Microsoft Authentication
- **@tanstack/react-query** - Data fetching
- **React Router** - Navigation

### Azure Services
- **App Service (Linux)** - API hosting (B1 SKU)
- **Azure SQL Database** - Relational data (S0 SKU)
- **Azure Storage** - Static website + evidence blobs
- **Azure CDN** - Global content delivery
- **Key Vault** - Secrets management
- **Application Insights** - Monitoring & diagnostics
- **Entra ID** - Identity & access management

### CI/CD
- **Azure DevOps** - Build & deployment pipelines
- **Azure DevOps Variable Groups** - Configuration management

## ✅ Prerequisites

### Required Software
- Azure CLI 2.50+ ([Install](https://docs.microsoft.com/cli/azure/install-azure-cli))
- Terraform 1.7+ ([Install](https://www.terraform.io/downloads))
- .NET 8 SDK ([Install](https://dotnet.microsoft.com/download/dotnet/8.0))
- Node.js 20+ ([Install](https://nodejs.org/))

### Azure Requirements
- Azure subscription with Owner or Contributor access
- Azure DevOps organization
- Service Principal with appropriate permissions
- Resource providers registered:
  - Microsoft.Web
  - Microsoft.Sql
  - Microsoft.Storage
  - Microsoft.CDN
  - Microsoft.KeyVault
  - Microsoft.Insights

### Access Requirements
- Azure Portal access
- Azure DevOps project admin access
- Entra ID app registration permissions

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd corecomply-mvp
```

### 2. Configure Azure DevOps

Create variable group `corecomply-infra-vars` with:

```yaml
ARM_SERVICE_CONNECTION: <your-service-connection>
TF_STATE_RG: <terraform-state-rg>
TF_STATE_STORAGE: <terraform-state-storage>
TF_STATE_CONTAINER: tfstate
SQL_ADMIN_LOGIN: <sql-admin-username>
SQL_ADMIN_PASSWORD: <sql-admin-password>  # Mark as secret
AAD_TENANT_ID: <your-tenant-id>
AAD_CLIENT_ID: <your-app-client-id>
```

### 3. Setup Entra ID

Follow [ENTRA-ID-SETUP.md](docs/ENTRA-ID-SETUP.md) to:
- Create app registration
- Configure authentication
- Set up API permissions
- Configure redirect URIs

### 4. Deploy Infrastructure

```bash
cd infra/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply infrastructure
terraform apply tfplan
```

### 5. Deploy Applications

Using Azure DevOps:
1. Create pipeline from `.azuredevops/api-deploy-pipeline.yml`
2. Create pipeline from `.azuredevops/web-deploy-pipeline.yml`
3. Run both pipelines

## 📚 Deployment

Comprehensive deployment guide available in [docs/DEPLOYING.md](docs/DEPLOYING.md)

### Deployment Steps Summary

1. **Terraform Backend Setup** - Create storage for state
2. **Configure Variables** - Set Azure DevOps variable groups
3. **Infrastructure Deployment** - Deploy via Terraform
4. **Entra ID Configuration** - Setup authentication
5. **API Deployment** - Build and deploy .NET API
6. **Web Deployment** - Build and deploy React app
7. **Post-Deployment Verification** - Complete checklist

### Deployment Timeline

- Infrastructure provisioning: ~15 minutes
- API first deployment: ~10 minutes
- Web first deployment: ~5 minutes
- **Total initial deployment: ~30 minutes**

## 🔧 Components

### Terraform Modules

All modules are self-contained and reusable:

- **`rg`** - Creates Azure Resource Group
- **`sql`** - Provisions Azure SQL Server and Database with firewall rules
- **`storage_website`** - Configures Storage Account with static website hosting
- **`appservice_api`** - Sets up App Service Plan and Linux Web App for .NET 8
- **`key_vault`** - Creates Key Vault with access policies
- **`app_insights`** - Configures Application Insights for monitoring
- **`cdn`** - Sets up CDN profile and endpoint for global distribution

### API Endpoints

RESTful API with full CRUD operations:

- **`/api/frameworks`** - Compliance frameworks management
- **`/api/controls`** - Control tracking and evidence
- **`/api/policies`** - Policy management
- **`/api/audits`** - Audit workflows and findings
- **`/api/evidence`** - Evidence upload to Azure Blob Storage

Swagger documentation available at `/swagger/index.html`

### Web Application

Single-page application with:

- **Microsoft Authentication** - Secure login via Entra ID
- **Dashboard** - Key metrics and statistics
- **Frameworks** - View and manage compliance frameworks
- **Controls** - Track compliance controls
- **Policies** - Manage organizational policies
- **Audits** - Audit workflows and findings

## 📖 Documentation

Comprehensive documentation in `/docs`:

- **[DEPLOYING.md](docs/DEPLOYING.md)** - Complete deployment guide
- **[ENTRA-ID-SETUP.md](docs/ENTRA-ID-SETUP.md)** - Authentication configuration
- **[POST-DEPLOY-CHECKLIST.md](docs/POST-DEPLOY-CHECKLIST.md)** - Verification steps

### API Documentation

Swagger UI available at: `https://<api-app-name>.azurewebsites.net/swagger`

## 🔒 Security

### Security Features

- **Managed Identity** - No credentials in code
- **Key Vault Integration** - Secure secrets management  
- **Entra ID Authentication** - Enterprise SSO
- **HTTPS Only** - All traffic encrypted
- **SQL Firewall** - Restricted database access
- **Private Blob Storage** - Evidence files secured
- **CORS Configuration** - Restricted origins

### Data Residency

All resources deployed to **Australia East** region ensuring:
- Australian data sovereignty compliance
- Local data storage requirements
- Reduced latency for AU users

## 🔍 Monitoring

### Application Insights

Real-time monitoring includes:
- Request/response metrics
- Failed request tracking
- Custom events and metrics
- Database query performance
- Availability tests

### Logging

Comprehensive logging via:
- App Service diagnostic logs
- Application Insights telemetry
- SQL Database query insights
- Storage analytics logs

## 🧪 Testing

### API Testing

```bash
# Get access token
TOKEN=$(az account get-access-token --resource api://corecomply --query accessToken -o tsv)

# Test endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://<api-app-name>.azurewebsites.net/api/frameworks
```

### Web Testing

1. Navigate to CDN endpoint
2. Click "Sign in with Microsoft"
3. Verify authentication flow
4. Test all pages and features

## 🤝 Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Pipeline validates changes
6. Merge after approval

### Code Standards

- **Terraform**: HashiCorp style guide
- **.NET**: Microsoft C# conventions
- **TypeScript/React**: Airbnb style guide
- **Documentation**: Markdown best practices

## 📊 Monitoring & Alerts

Recommended alerts to configure:

- API response time > 2 seconds
- Failed requests > 5%
- Database DTU > 80%
- Storage capacity > 80%
- CDN 5xx errors > 1%

## 🆘 Troubleshooting

### Common Issues

**Terraform state lock**
```bash
az storage blob lease break \
  --account-name <storage> \
  --container-name tfstate \
  --blob-name corecomply/infra.tfstate
```

**API not starting**
```bash
az webapp log tail \
  --name <api-app-name> \
  --resource-group <rg-name>
```

**Authentication failures**
- Verify redirect URIs in Entra ID
- Check client ID and tenant ID
- Confirm API scope configuration

## 📅 Roadmap

### December 15, 2025 MVP
- ✅ Core infrastructure
- ✅ API with essential endpoints
- ✅ Web app with authentication
- ✅ Evidence upload functionality
- ✅ CI/CD pipelines

### Future Enhancements
- Multi-tenancy support
- Advanced reporting
- Mobile applications
- Enhanced audit workflows
- Integration APIs

## 📝 License

Copyright © 2025 CoreComply. All rights reserved.

---

## 🙋 Support

For deployment support:
- Review [DEPLOYING.md](docs/DEPLOYING.md)
- Check [POST-DEPLOY-CHECKLIST.md](docs/POST-DEPLOY-CHECKLIST.md)
- Consult [ENTRA-ID-SETUP.md](docs/ENTRA-ID-SETUP.md)

For technical issues, create an issue in the repository.

---

**Built with ❤️ for Australian compliance management**
