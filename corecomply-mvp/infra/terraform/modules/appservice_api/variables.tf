variable "name_prefix" {
  type = string
}

variable "rg_name" {
  type = string
}

variable "location" {
  type = string
}

variable "app_insights_id" {
  type = string
}

variable "kv_id" {
  type = string
}

variable "app_settings" {
  type = map(string)
}

variable "tags" {
  type = map(string)
}
