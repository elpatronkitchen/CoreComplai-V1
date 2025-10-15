resource "azurerm_mssql_server" "main" {
  name                         = var.name
  resource_group_name          = var.rg_name
  location                     = var.location
  version                      = "12.0"
  administrator_login          = var.admin_login
  administrator_login_password = var.admin_password
  tags                         = var.tags

  azuread_administrator {
    login_username = var.aad_admin_login
    object_id      = var.aad_admin_object_id
  }
}

resource "azurerm_mssql_database" "main" {
  name      = "${var.name}-db"
  server_id = azurerm_mssql_server.main.id
  sku_name  = "S0"
  tags      = var.tags
}

resource "azurerm_mssql_firewall_rule" "allow_azure" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
