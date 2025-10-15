variable "name" {
  type = string
}

variable "rg_name" {
  type = string
}

variable "location" {
  type = string
}

variable "admin_login" {
  type = string
}

variable "admin_password" {
  type      = string
  sensitive = true
}

variable "aad_admin_object_id" {
  type        = string
  description = "Object ID of the AAD user or group to be SQL Admin"
}

variable "aad_admin_login" {
  type        = string
  description = "Login name of the AAD user or group to be SQL Admin"
}

variable "tags" {
  type = map(string)
}
