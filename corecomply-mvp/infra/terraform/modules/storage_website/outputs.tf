output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "storage_account_id" {
  value = azurerm_storage_account.main.id
}

output "static_site_url" {
  value = azurerm_storage_account.main.primary_web_endpoint
}

output "static_site_primary_endpoint_host" {
  value = azurerm_storage_account.main.primary_web_host
}

output "primary_access_key" {
  value     = azurerm_storage_account.main.primary_access_key
  sensitive = true
}
