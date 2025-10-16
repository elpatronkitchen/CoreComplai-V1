locals {
  name = "${var.project}-${var.env}"
  tags = {
    project = var.project
    env     = var.env
  }
}

module "rg" {
  source   = "./modules/rg"
  name     = "${local.name}-rg"
  location = var.location
  tags     = local.tags
}

module "app_insights" {
  source   = "./modules/app_insights"
  name     = "${local.name}-appi"
  location = var.location
  rg_name  = module.rg.name
  tags     = local.tags
}

module "sql" {
  source              = "./modules/sql"
  name                = "${local.name}-sql"
  rg_name             = module.rg.name
  location            = var.location
  admin_login         = var.sql_admin_login
  admin_password      = var.sql_admin_password
  aad_admin_object_id = var.sql_aad_admin_object_id
  aad_admin_login     = var.sql_aad_admin_login
  tags                = local.tags
}

module "storage_website" {
  source   = "./modules/storage_website"
  name     = "${local.name}web"
  rg_name  = module.rg.name
  location = var.location
  tags     = local.tags
}

module "cdn" {
  source      = "./modules/cdn"
  rg_name     = module.rg.name
  origin_host = module.storage_website.static_site_primary_endpoint_host
  name_prefix = local.name
  tags        = local.tags
}

module "key_vault" {
  source    = "./modules/key_vault"
  name      = "${local.name}-kv"
  rg_name   = module.rg.name
  location  = var.location
  tenant_id = var.aad_tenant_id
  tags      = local.tags
}

module "appservice_api" {
  source          = "./modules/appservice_api"
  name_prefix     = "${local.name}-api"
  rg_name         = module.rg.name
  location        = var.location
  app_insights_id = module.app_insights.id
  kv_id           = module.key_vault.id
  tags            = local.tags
  app_settings = {
    "ASPNETCORE_ENVIRONMENT"                   = "Production"
    "ApplicationInsights__ConnectionString"    = module.app_insights.connection_string
    "AzureAd__TenantId"                        = var.aad_tenant_id
    "AzureAd__ClientId"                        = var.aad_api_client_id
    "AzureAd__Audience"                        = "api://corecomply"
    "ConnectionStrings__Sql"                   = "Server=tcp:${module.sql.server_fqdn},1433;Database=${module.sql.database_name};Authentication=Active Directory Managed Identity;Encrypt=True;TrustServerCertificate=False;"
    "Storage__AccountName"                     = module.storage_website.storage_account_name
    "Storage__Container"                       = "evidence"
    "AllowedOrigins__0"                        = "https://${module.cdn.endpoint_hostname}"
    "AllowedOrigins__1"                        = "https://${module.storage_website.static_site_primary_endpoint_host}"
  }
}

# Grant API Managed Identity access to Storage
resource "azurerm_role_assignment" "api_to_storage" {
  scope                = module.storage_website.storage_account_id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = module.appservice_api.principal_id
}
