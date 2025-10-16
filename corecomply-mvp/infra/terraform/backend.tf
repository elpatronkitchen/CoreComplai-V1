terraform {
  backend "azurerm" {
    resource_group_name  = var.tf_state_rg
    storage_account_name = var.tf_state_storage
    container_name       = var.tf_state_container
    key                  = "corecomply/infra.tfstate"
  }
}
