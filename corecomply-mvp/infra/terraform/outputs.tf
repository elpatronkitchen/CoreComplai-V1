output "web_endpoint" {
  value = module.storage_website.static_site_url
}

output "cdn_endpoint" {
  value = module.cdn.endpoint_hostname
}

output "api_base_url" {
  value = module.appservice_api.default_hostname
}

output "sql_server_fqdn" {
  value = module.sql.server_fqdn
}

output "storage_account" {
  value = module.storage_website.storage_account_name
}

output "app_insights_key" {
  value     = module.app_insights.instrumentation_key
  sensitive = true
}

output "api_principal_id" {
  value       = module.appservice_api.principal_id
  description = "Managed Identity Principal ID for API (use for SQL contained user setup)"
}

output "web_client_id" {
  value       = var.aad_web_client_id
  description = "Web/SPA App Registration Client ID (for frontend configuration)"
}
