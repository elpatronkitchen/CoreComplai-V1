# Terraform Outputs for CoreComply Documentation Site Infrastructure

#############################################
# Resource Group
#############################################

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.docs.name
}

output "resource_group_id" {
  description = "ID of the resource group"
  value       = azurerm_resource_group.docs.id
}

output "resource_group_location" {
  description = "Location of the resource group"
  value       = azurerm_resource_group.docs.location
}

#############################################
# Storage Account
#############################################

output "storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.docs.name
}

output "storage_account_id" {
  description = "ID of the storage account"
  value       = azurerm_storage_account.docs.id
}

output "storage_primary_web_endpoint" {
  description = "Primary web endpoint for static website"
  value       = azurerm_storage_account.docs.primary_web_endpoint
}

output "storage_primary_web_host" {
  description = "Primary web host for static website"
  value       = azurerm_storage_account.docs.primary_web_host
}

output "storage_primary_blob_endpoint" {
  description = "Primary blob endpoint"
  value       = azurerm_storage_account.docs.primary_blob_endpoint
  sensitive   = true
}

output "storage_connection_string" {
  description = "Storage account connection string"
  value       = azurerm_storage_account.docs.primary_connection_string
  sensitive   = true
}

#############################################
# Azure CDN (Front Door)
#############################################

output "cdn_profile_name" {
  description = "Name of the CDN Front Door profile"
  value       = azurerm_cdn_frontdoor_profile.docs.name
}

output "cdn_profile_id" {
  description = "ID of the CDN Front Door profile"
  value       = azurerm_cdn_frontdoor_profile.docs.id
}

output "cdn_endpoint_name" {
  description = "Name of the CDN endpoint"
  value       = azurerm_cdn_frontdoor_endpoint.docs.name
}

output "cdn_endpoint_hostname" {
  description = "Hostname of the CDN endpoint"
  value       = azurerm_cdn_frontdoor_endpoint.docs.host_name
}

output "cdn_endpoint_url" {
  description = "Full URL of the CDN endpoint"
  value       = "https://${azurerm_cdn_frontdoor_endpoint.docs.host_name}"
}

output "cdn_custom_domain" {
  description = "Custom domain configured for CDN (if any)"
  value       = var.cdn_custom_domain != "" ? var.cdn_custom_domain : null
}

output "cdn_custom_domain_url" {
  description = "Full URL of the custom domain (if configured)"
  value       = var.cdn_custom_domain != "" ? "https://${var.cdn_custom_domain}" : null
}

#############################################
# Monitoring
#############################################

output "log_analytics_workspace_id" {
  description = "ID of the Log Analytics workspace"
  value       = var.enable_monitoring ? azurerm_log_analytics_workspace.docs[0].id : null
}

output "log_analytics_workspace_name" {
  description = "Name of the Log Analytics workspace"
  value       = var.enable_monitoring ? azurerm_log_analytics_workspace.docs[0].name : null
}

#############################################
# Deployment Information
#############################################

output "documentation_site_url" {
  description = "Primary URL to access the documentation site"
  value       = var.cdn_custom_domain != "" ? "https://${var.cdn_custom_domain}" : "https://${azurerm_cdn_frontdoor_endpoint.docs.host_name}"
}

output "storage_direct_url" {
  description = "Direct storage URL (bypass CDN)"
  value       = azurerm_storage_account.docs.primary_web_endpoint
}

output "environment" {
  description = "Deployment environment"
  value       = var.environment
}

output "deployment_region" {
  description = "Azure region where resources are deployed"
  value       = azurerm_resource_group.docs.location
}

#############################################
# Azure DevOps Pipeline Variables
#############################################

output "pipeline_variables" {
  description = "Variables to use in Azure DevOps pipelines"
  value = {
    RESOURCE_GROUP     = azurerm_resource_group.docs.name
    STORAGE_ACCOUNT    = azurerm_storage_account.docs.name
    CDN_PROFILE        = azurerm_cdn_frontdoor_profile.docs.name
    CDN_ENDPOINT       = azurerm_cdn_frontdoor_endpoint.docs.name
    DOCS_URL           = var.cdn_custom_domain != "" ? "https://${var.cdn_custom_domain}" : "https://${azurerm_cdn_frontdoor_endpoint.docs.host_name}"
    STORAGE_WEB_URL    = azurerm_storage_account.docs.primary_web_endpoint
    ENVIRONMENT        = var.environment
    LOCATION           = azurerm_resource_group.docs.location
  }
}

#############################################
# Cost Estimation
#############################################

output "estimated_monthly_cost_usd" {
  description = "Estimated monthly cost in USD (approximate)"
  value = {
    storage_account = var.storage_replication_type == "LRS" ? 5 : (var.storage_replication_type == "GRS" ? 10 : 15)
    cdn_frontdoor   = var.cdn_sku == "Standard_AzureFrontDoor" ? 35 : 350
    log_analytics   = var.enable_monitoring ? 5 : 0
    total           = (var.storage_replication_type == "LRS" ? 5 : (var.storage_replication_type == "GRS" ? 10 : 15)) + (var.cdn_sku == "Standard_AzureFrontDoor" ? 35 : 350) + (var.enable_monitoring ? 5 : 0)
    note            = "Costs are approximate and exclude data transfer charges. Actual costs may vary based on usage."
  }
}

#############################################
# DNS Configuration (for custom domain setup)
#############################################

output "dns_validation_records" {
  description = "DNS records required for custom domain validation"
  value = var.cdn_custom_domain != "" ? {
    cname_record = {
      name  = var.cdn_custom_domain
      type  = "CNAME"
      value = azurerm_cdn_frontdoor_endpoint.docs.host_name
      ttl   = 3600
    }
    txt_validation = {
      name  = "_dnsauth.${var.cdn_custom_domain}"
      type  = "TXT"
      value = try(azurerm_cdn_frontdoor_custom_domain.docs[0].validation_token, "N/A")
      ttl   = 3600
    }
  } : null
}

#############################################
# Resource Tags
#############################################

output "resource_tags" {
  description = "Tags applied to all resources"
  value       = local.common_tags
}

#############################################
# Summary
#############################################

output "deployment_summary" {
  description = "Summary of deployed infrastructure"
  value = {
    project             = var.project_name
    environment         = var.environment
    location            = azurerm_resource_group.docs.location
    primary_url         = var.cdn_custom_domain != "" ? "https://${var.cdn_custom_domain}" : "https://${azurerm_cdn_frontdoor_endpoint.docs.host_name}"
    storage_url         = azurerm_storage_account.docs.primary_web_endpoint
    cdn_hostname        = azurerm_cdn_frontdoor_endpoint.docs.host_name
    monitoring_enabled  = var.enable_monitoring
    custom_domain       = var.cdn_custom_domain != "" ? var.cdn_custom_domain : "Not configured"
    estimated_cost_usd  = (var.storage_replication_type == "LRS" ? 5 : (var.storage_replication_type == "GRS" ? 10 : 15)) + (var.cdn_sku == "Standard_AzureFrontDoor" ? 35 : 350) + (var.enable_monitoring ? 5 : 0)
  }
}
