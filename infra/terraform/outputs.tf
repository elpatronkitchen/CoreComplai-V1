output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.main.name
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

output "search_endpoint" {
  description = "Endpoint of Azure AI Search"
  value       = "https://${azurerm_search_service.main.name}.search.windows.net"
}

output "openai_endpoint" {
  description = "Endpoint of Azure OpenAI"
  value       = azurerm_cognitive_account.openai.endpoint
}

output "sql_server_fqdn" {
  description = "Fully qualified domain name of the SQL Server"
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "web_app_url" {
  description = "URL of the web app (React frontend)"
  value       = "https://${azurerm_linux_web_app.web.default_hostname}"
}

output "api_app_url" {
  description = "URL of the API app (.NET backend)"
  value       = "https://${azurerm_linux_web_app.api.default_hostname}"
}

output "function_app_name" {
  description = "Name of the Azure Functions app"
  value       = azurerm_linux_function_app.main.name
}

output "cdn_endpoint_url" {
  description = "URL of the CDN endpoint"
  value       = "https://${azurerm_cdn_endpoint.main.fqdn}"
}

output "app_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "api_managed_identity_principal_id" {
  description = "Principal ID of the API app managed identity"
  value       = azurerm_linux_web_app.api.identity[0].principal_id
}

output "functions_managed_identity_principal_id" {
  description = "Principal ID of the Functions app managed identity"
  value       = azurerm_linux_function_app.main.identity[0].principal_id
}
