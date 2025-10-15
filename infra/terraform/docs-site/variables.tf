# Terraform Variables for CoreComply Documentation Site Infrastructure

#############################################
# Core Configuration
#############################################

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "corecomply"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "environment" {
  description = "Environment name (dev, qa, staging, prod)"
  type        = string
  
  validation {
    condition     = contains(["dev", "qa", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, qa, staging, or prod."
  }
}

variable "location" {
  description = "Azure region for resource deployment"
  type        = string
  default     = "australiaeast"
  
  validation {
    condition     = contains(["australiaeast", "australiasoutheast", "eastus", "westus2"], var.location)
    error_message = "Location must be a supported Azure region."
  }
}

#############################################
# Storage Account Configuration
#############################################

variable "storage_replication_type" {
  description = "Storage account replication type"
  type        = string
  default     = "LRS"
  
  validation {
    condition     = contains(["LRS", "GRS", "RAGRS", "ZRS", "GZRS", "RAGZRS"], var.storage_replication_type)
    error_message = "Storage replication type must be LRS, GRS, RAGRS, ZRS, GZRS, or RAGZRS."
  }
}

variable "blob_retention_days" {
  description = "Number of days to retain deleted blobs"
  type        = number
  default     = 7
  
  validation {
    condition     = var.blob_retention_days >= 1 && var.blob_retention_days <= 365
    error_message = "Blob retention days must be between 1 and 365."
  }
}

variable "version_retention_days" {
  description = "Number of days to retain old blob versions"
  type        = number
  default     = 30
  
  validation {
    condition     = var.version_retention_days >= 1 && var.version_retention_days <= 365
    error_message = "Version retention days must be between 1 and 365."
  }
}

variable "enable_lifecycle_management" {
  description = "Enable storage lifecycle management policies"
  type        = bool
  default     = true
}

#############################################
# CDN Configuration
#############################################

variable "cdn_sku" {
  description = "Azure CDN (Front Door) SKU"
  type        = string
  default     = "Standard_AzureFrontDoor"
  
  validation {
    condition     = contains(["Standard_AzureFrontDoor", "Premium_AzureFrontDoor"], var.cdn_sku)
    error_message = "CDN SKU must be Standard_AzureFrontDoor or Premium_AzureFrontDoor."
  }
}

variable "cdn_custom_domain" {
  description = "Custom domain for CDN endpoint (e.g., docs.corecomply.com.au)"
  type        = string
  default     = ""
}

#############################################
# Security & Networking
#############################################

variable "enable_public_access" {
  description = "Allow public access to storage account"
  type        = bool
  default     = true
}

variable "allowed_ip_ranges" {
  description = "List of allowed IP ranges for storage account access"
  type        = list(string)
  default     = []
  
  validation {
    condition     = alltrue([for ip in var.allowed_ip_ranges : can(regex("^([0-9]{1,3}\\.){3}[0-9]{1,3}(/[0-9]{1,2})?$", ip))])
    error_message = "All IP ranges must be in CIDR notation (e.g., 203.0.113.0/24)."
  }
}

#############################################
# Monitoring & Logging
#############################################

variable "enable_monitoring" {
  description = "Enable Azure Monitor and Log Analytics"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Number of days to retain logs in Log Analytics"
  type        = number
  default     = 90
  
  validation {
    condition     = var.log_retention_days >= 30 && var.log_retention_days <= 730
    error_message = "Log retention days must be between 30 and 730."
  }
}

#############################################
# Tags
#############################################

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
