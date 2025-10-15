variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "corecomply-classification-audit-rg"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "Australia East"
}

variable "storage_account_name" {
  description = "Name of the storage account (must be globally unique)"
  type        = string
}

variable "key_vault_name" {
  description = "Name of the Key Vault (must be globally unique)"
  type        = string
}

variable "search_service_name" {
  description = "Name of the Azure AI Search service (must be globally unique)"
  type        = string
}

variable "openai_account_name" {
  description = "Name of the Azure OpenAI account"
  type        = string
}

variable "sql_server_name" {
  description = "Name of the Azure SQL Server (must be globally unique)"
  type        = string
}

variable "sql_database_name" {
  description = "Name of the Azure SQL Database"
  type        = string
  default     = "classification-audit-db"
}

variable "sql_admin_username" {
  description = "SQL Server admin username"
  type        = string
  sensitive   = true
}

variable "sql_admin_password" {
  description = "SQL Server admin password"
  type        = string
  sensitive   = true
}

variable "sql_admin_group_object_id" {
  description = "Azure AD group object ID for SQL admin"
  type        = string
}

variable "app_service_plan_name" {
  description = "Name of the App Service Plan"
  type        = string
  default     = "corecomply-classification-audit-plan"
}

variable "web_app_name" {
  description = "Name of the web app (React frontend)"
  type        = string
}

variable "api_app_name" {
  description = "Name of the API app (.NET backend)"
  type        = string
}

variable "function_app_name" {
  description = "Name of the Azure Functions app"
  type        = string
}

variable "app_insights_name" {
  description = "Name of Application Insights"
  type        = string
  default     = "corecomply-classification-audit-insights"
}

variable "cdn_profile_name" {
  description = "Name of the CDN profile"
  type        = string
  default     = "corecomply-classification-audit-cdn"
}

variable "cdn_endpoint_name" {
  description = "Name of the CDN endpoint"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "Production"
    Project     = "CoreComply Classification Audit"
    ManagedBy   = "Terraform"
  }
}
