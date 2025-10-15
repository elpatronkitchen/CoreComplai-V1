variable "project" {
  type    = string
  default = "corecomply"
}

variable "location" {
  type    = string
  default = "australiaeast"
}

variable "env" {
  type    = string
  default = "prod"
}

variable "tf_state_rg" {
  type = string
}

variable "tf_state_storage" {
  type = string
}

variable "tf_state_container" {
  type = string
}

variable "sql_admin_login" {
  type = string
}

variable "sql_admin_password" {
  type      = string
  sensitive = true
}

variable "aad_tenant_id" {
  type = string
}

variable "aad_api_client_id" {
  type        = string
  description = "Client ID of the API app registration"
}

variable "aad_web_client_id" {
  type        = string
  description = "Client ID of the Web/SPA app registration"
}

variable "sql_aad_admin_object_id" {
  type        = string
  description = "Object ID of the AAD user or group to be SQL Admin"
}

variable "sql_aad_admin_login" {
  type        = string
  description = "Login name of the AAD user or group to be SQL Admin"
}
