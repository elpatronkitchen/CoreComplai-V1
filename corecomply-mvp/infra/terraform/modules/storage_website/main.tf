resource "azurerm_storage_account" "main" {
  name                     = var.name
  resource_group_name      = var.rg_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = var.tags

  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }
}

resource "azurerm_storage_container" "evidence" {
  name                  = "evidence"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}
