resource "azurerm_service_plan" "main" {
  name                = "${var.name_prefix}-plan"
  resource_group_name = var.rg_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "P1v2"
  tags                = var.tags
}

resource "azurerm_linux_web_app" "main" {
  name                = var.name_prefix
  resource_group_name = var.rg_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.main.id
  tags                = var.tags

  site_config {
    always_on        = true
    ftps_state       = "Disabled"
    http2_enabled    = true
    
    application_stack {
      dotnet_version = "8.0"
    }
  }

  https_only = true

  app_settings = var.app_settings

  identity {
    type = "SystemAssigned"
  }
}

# Deployment slot for blue-green deployments
resource "azurerm_linux_web_app_slot" "staging" {
  name           = "staging"
  app_service_id = azurerm_linux_web_app.main.id
  
  site_config {
    always_on        = true
    ftps_state       = "Disabled"
    http2_enabled    = true
    
    application_stack {
      dotnet_version = "8.0"
    }
  }

  https_only = true

  app_settings = var.app_settings

  identity {
    type = "SystemAssigned"
  }
}
