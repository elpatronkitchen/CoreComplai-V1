terraform {
  required_version = ">= 1.5"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.75"
    }
  }

  backend "azurerm" {
    resource_group_name  = "corecomply-tfstate-rg"
    storage_account_name = "ccomplytfstate"
    container_name       = "tfstate"
    key                  = "classification-audit.tfstate"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }
  }
}

data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = var.tags
}

# Storage Account for evidence and blobs
resource "azurerm_storage_account" "main" {
  name                     = var.storage_account_name
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "GRS"

  blob_properties {
    versioning_enabled = true

    delete_retention_policy {
      days = 30
    }
  }

  tags = var.tags
}

resource "azurerm_storage_container" "evidence" {
  name                  = "evidence"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Key Vault for secrets
resource "azurerm_key_vault" "main" {
  name                       = var.key_vault_name
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7
  purge_protection_enabled   = true

  tags = var.tags
}

# Azure AI Search
resource "azurerm_search_service" "main" {
  name                = var.search_service_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "standard"

  tags = var.tags
}

# Cognitive Services (Azure OpenAI)
resource "azurerm_cognitive_account" "openai" {
  name                = var.openai_account_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "OpenAI"
  sku_name            = "S0"

  tags = var.tags
}

# Azure SQL Database
resource "azurerm_mssql_server" "main" {
  name                         = var.sql_server_name
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_username
  administrator_login_password = var.sql_admin_password

  azuread_administrator {
    login_username = "sql-admin-group"
    object_id      = var.sql_admin_group_object_id
  }

  tags = var.tags
}

resource "azurerm_mssql_database" "main" {
  name      = var.sql_database_name
  server_id = azurerm_mssql_server.main.id
  sku_name  = "S0"

  tags = var.tags
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = var.app_service_plan_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "P1v2"

  tags = var.tags
}

# Web App (React frontend)
resource "azurerm_linux_web_app" "web" {
  name                = var.web_app_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = true
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "20-lts"
  }

  tags = var.tags
}

# API App (.NET backend)
resource "azurerm_linux_web_app" "api" {
  name                = var.api_app_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = true
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    "ASPNETCORE_ENVIRONMENT"    = "Production"
    "AZURE_KEYVAULT_URI"        = azurerm_key_vault.main.vault_uri
    "AZURE_OPENAI_ENDPOINT"     = azurerm_cognitive_account.openai.endpoint
    "AZURE_SEARCH_ENDPOINT"     = "https://${azurerm_search_service.main.name}.search.windows.net"
    "AZURE_BLOB_ACCOUNT"        = azurerm_storage_account.main.primary_blob_endpoint
    "AZURE_BLOB_CONTAINER"      = azurerm_storage_container.evidence.name
    "DATABASE_CONNECTION_STRING" = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.main.vault_uri}secrets/sql-connection-string)"
  }

  tags = var.tags
}

# Azure Functions App
resource "azurerm_linux_function_app" "main" {
  name                       = var.function_app_name
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  service_plan_id            = azurerm_service_plan.main.id
  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key

  site_config {}

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    "AZURE_KEYVAULT_URI"       = azurerm_key_vault.main.vault_uri
    "FUNCTIONS_WORKER_RUNTIME" = "dotnet-isolated"
  }

  tags = var.tags
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = var.app_insights_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"

  tags = var.tags
}

# CDN Profile
resource "azurerm_cdn_profile" "main" {
  name                = var.cdn_profile_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "Standard_Microsoft"

  tags = var.tags
}

resource "azurerm_cdn_endpoint" "main" {
  name                = var.cdn_endpoint_name
  profile_name        = azurerm_cdn_profile.main.name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  origin {
    name      = "web-app-origin"
    host_name = azurerm_linux_web_app.web.default_hostname
  }

  tags = var.tags
}

# Key Vault Access Policies
resource "azurerm_key_vault_access_policy" "api" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_web_app.api.identity[0].principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

resource "azurerm_key_vault_access_policy" "functions" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_function_app.main.identity[0].principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

# Storage Blob Data Contributor role for API
resource "azurerm_role_assignment" "api_storage" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_web_app.api.identity[0].principal_id
}

# Storage Blob Data Contributor role for Functions
resource "azurerm_role_assignment" "functions_storage" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_function_app.main.identity[0].principal_id
}
