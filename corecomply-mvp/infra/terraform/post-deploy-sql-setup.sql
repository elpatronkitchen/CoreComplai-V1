-- Post-Deployment SQL Setup Script
-- Run this script after Terraform deployment to configure Managed Identity access

-- This script must be run by a user who is an AAD Administrator on the SQL Server
-- Connect to the database (not master) using Azure AD authentication

-- Replace <API-MANAGED-IDENTITY-NAME> with the actual name of your API App Service
-- Format: corecomply-prod-api

USE [corecomply-prod-sql-db];
GO

-- Create contained database user for the API Managed Identity
CREATE USER [corecomply-prod-api] FROM EXTERNAL PROVIDER;
GO

-- Grant necessary permissions
ALTER ROLE db_datareader ADD MEMBER [corecomply-prod-api];
ALTER ROLE db_datawriter ADD MEMBER [corecomply-prod-api];
GO

-- Optional: Grant additional permissions if needed
-- GRANT EXECUTE TO [corecomply-prod-api];
-- ALTER ROLE db_owner ADD MEMBER [corecomply-prod-api]; -- Use with caution

-- Verify user creation
SELECT name, type_desc, authentication_type_desc
FROM sys.database_principals
WHERE name = 'corecomply-prod-api';
GO
