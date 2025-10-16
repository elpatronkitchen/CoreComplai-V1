# Terraform Configuration for CoreComply Documentation Site
# Deploys Azure Static Website with CDN for MkDocs documentation

terraform {
  required_version = ">= 1.6.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.45"
    }
  }
  
  backend "azurerm" {
    # Backend configuration provided via pipeline or terraform init
    # -backend-config="resource_group_name=rg-terraform-state"
    # -backend-config="storage_account_name=sttfstate"
    # -backend-config="container_name=tfstate"
    # -backend-config="key=docs-site.tfstate"
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
  }
  
  skip_provider_registration = false
}

# Local variables for resource naming
locals {
  resource_prefix = "${var.project_name}-docs-${var.environment}"
  
  common_tags = merge(
    var.tags,
    {
      Environment    = var.environment
      Project        = var.project_name
      ManagedBy      = "Terraform"
      Purpose        = "Documentation"
      CostCenter     = "Engineering"
      Compliance     = "APGF"
      DeploymentDate = timestamp()
    }
  )
  
  # Storage account name (must be globally unique, lowercase, no hyphens)
  storage_name = replace(lower("st${var.project_name}docs${var.environment}"), "-", "")
}

# Data source for current Azure client configuration
data "azurerm_client_config" "current" {}

#############################################
# Resource Group
#############################################

resource "azurerm_resource_group" "docs" {
  name     = "rg-${local.resource_prefix}"
  location = var.location
  tags     = local.common_tags
}

#############################################
# Storage Account for Static Website
#############################################

resource "azurerm_storage_account" "docs" {
  name                     = local.storage_name
  resource_group_name      = azurerm_resource_group.docs.name
  location                 = azurerm_resource_group.docs.location
  account_tier             = "Standard"
  account_replication_type = var.storage_replication_type
  account_kind             = "StorageV2"
  
  # Enable static website hosting
  static_website {
    index_document     = "index.html"
    error_404_document = "404.html"
  }
  
  # Security settings
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = true
  enable_https_traffic_only       = true
  
  # Networking
  network_rules {
    default_action             = var.enable_public_access ? "Allow" : "Deny"
    bypass                     = ["AzureServices"]
    ip_rules                   = var.allowed_ip_ranges
    virtual_network_subnet_ids = []
  }
  
  # Blob properties
  blob_properties {
    # Enable versioning for audit trail
    versioning_enabled = true
    
    # CORS for CDN access
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "HEAD", "OPTIONS"]
      allowed_origins    = var.cdn_custom_domain != "" ? ["https://${var.cdn_custom_domain}"] : ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
    
    # Delete retention policy
    delete_retention_policy {
      days = var.blob_retention_days
    }
    
    # Container delete retention
    container_delete_retention_policy {
      days = var.blob_retention_days
    }
  }
  
  tags = local.common_tags
}

#############################################
# Azure CDN (Front Door Standard)
#############################################

resource "azurerm_cdn_frontdoor_profile" "docs" {
  name                = "afd-${local.resource_prefix}"
  resource_group_name = azurerm_resource_group.docs.name
  sku_name            = var.cdn_sku
  
  tags = local.common_tags
}

resource "azurerm_cdn_frontdoor_endpoint" "docs" {
  name                     = "ep-${local.resource_prefix}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.docs.id
  
  tags = local.common_tags
}

resource "azurerm_cdn_frontdoor_origin_group" "docs" {
  name                     = "og-${local.resource_prefix}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.docs.id
  
  load_balancing {
    additional_latency_in_milliseconds = 50
    sample_size                        = 4
    successful_samples_required        = 3
  }
  
  health_probe {
    interval_in_seconds = 100
    path                = "/index.html"
    protocol            = "Https"
    request_type        = "HEAD"
  }
}

resource "azurerm_cdn_frontdoor_origin" "docs" {
  name                          = "origin-${local.resource_prefix}"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.docs.id
  
  enabled                        = true
  host_name                      = azurerm_storage_account.docs.primary_web_host
  http_port                      = 80
  https_port                     = 443
  origin_host_header             = azurerm_storage_account.docs.primary_web_host
  priority                       = 1
  weight                         = 1000
  certificate_name_check_enabled = true
}

resource "azurerm_cdn_frontdoor_route" "docs" {
  name                          = "route-${local.resource_prefix}"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.docs.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.docs.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.docs.id]
  
  enabled                = true
  forwarding_protocol    = "HttpsOnly"
  https_redirect_enabled = true
  patterns_to_match      = ["/*"]
  supported_protocols    = ["Http", "Https"]
  
  cache {
    query_string_caching_behavior = "IgnoreQueryString"
    compression_enabled           = true
    content_types_to_compress = [
      "text/html",
      "text/css",
      "text/javascript",
      "application/javascript",
      "application/json",
      "application/xml",
      "image/svg+xml"
    ]
  }
}

#############################################
# Custom Domain (Optional)
#############################################

resource "azurerm_cdn_frontdoor_custom_domain" "docs" {
  count = var.cdn_custom_domain != "" ? 1 : 0
  
  name                     = replace(var.cdn_custom_domain, ".", "-")
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.docs.id
  host_name                = var.cdn_custom_domain
  
  tls {
    certificate_type    = "ManagedCertificate"
    minimum_tls_version = "TLS12"
  }
}

resource "azurerm_cdn_frontdoor_custom_domain_association" "docs" {
  count = var.cdn_custom_domain != "" ? 1 : 0
  
  cdn_frontdoor_custom_domain_id = azurerm_cdn_frontdoor_custom_domain.docs[0].id
  cdn_frontdoor_route_ids        = [azurerm_cdn_frontdoor_route.docs.id]
}

#############################################
# Monitoring & Diagnostics
#############################################

resource "azurerm_log_analytics_workspace" "docs" {
  count = var.enable_monitoring ? 1 : 0
  
  name                = "law-${local.resource_prefix}"
  resource_group_name = azurerm_resource_group.docs.name
  location            = azurerm_resource_group.docs.location
  sku                 = "PerGB2018"
  retention_in_days   = var.log_retention_days
  
  tags = local.common_tags
}

resource "azurerm_monitor_diagnostic_setting" "storage" {
  count = var.enable_monitoring ? 1 : 0
  
  name                       = "diag-storage-${local.resource_prefix}"
  target_resource_id         = "${azurerm_storage_account.docs.id}/blobServices/default"
  log_analytics_workspace_id = azurerm_log_analytics_workspace.docs[0].id
  
  enabled_log {
    category = "StorageRead"
  }
  
  enabled_log {
    category = "StorageWrite"
  }
  
  enabled_log {
    category = "StorageDelete"
  }
  
  metric {
    category = "Transaction"
    enabled  = true
  }
}

resource "azurerm_monitor_diagnostic_setting" "cdn" {
  count = var.enable_monitoring ? 1 : 0
  
  name                       = "diag-cdn-${local.resource_prefix}"
  target_resource_id         = azurerm_cdn_frontdoor_profile.docs.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.docs[0].id
  
  enabled_log {
    category = "FrontDoorAccessLog"
  }
  
  enabled_log {
    category = "FrontDoorHealthProbeLog"
  }
  
  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

#############################################
# Storage Lifecycle Management
#############################################

resource "azurerm_storage_management_policy" "docs" {
  storage_account_id = azurerm_storage_account.docs.id
  
  rule {
    name    = "deleteOldVersions"
    enabled = true
    
    filters {
      blob_types = ["blockBlob"]
    }
    
    actions {
      version {
        delete_after_days_since_creation = var.version_retention_days
      }
    }
  }
  
  rule {
    name    = "tierToCool"
    enabled = var.enable_lifecycle_management
    
    filters {
      blob_types   = ["blockBlob"]
      prefix_match = ["assets/"]
    }
    
    actions {
      base_blob {
        tier_to_cool_after_days_since_modification_greater_than = 90
      }
    }
  }
}

#############################################
# Resource Lock (Production Only)
#############################################

resource "azurerm_management_lock" "docs_rg" {
  count = var.environment == "prod" ? 1 : 0
  
  name       = "lock-${local.resource_prefix}"
  scope      = azurerm_resource_group.docs.id
  lock_level = "CanNotDelete"
  notes      = "Prevents accidental deletion of documentation infrastructure"
}
