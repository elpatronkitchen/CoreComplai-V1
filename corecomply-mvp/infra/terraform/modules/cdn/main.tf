resource "azurerm_cdn_profile" "main" {
  name                = "${var.name_prefix}-cdn"
  location            = "Global"
  resource_group_name = var.rg_name
  sku                 = "Standard_Microsoft"
  tags                = var.tags
}

resource "azurerm_cdn_endpoint" "main" {
  name                = "${var.name_prefix}-endpoint"
  profile_name        = azurerm_cdn_profile.main.name
  location            = azurerm_cdn_profile.main.location
  resource_group_name = var.rg_name
  tags                = var.tags

  origin {
    name      = "primary"
    host_name = var.origin_host
  }

  is_http_allowed  = false
  is_https_allowed = true
}
