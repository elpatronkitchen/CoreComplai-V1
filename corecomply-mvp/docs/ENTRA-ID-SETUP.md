# Entra ID (Azure AD) Configuration

## Overview

CoreComply requires **two separate app registrations**:
1. **API App Registration** - For the .NET Web API
2. **Web/SPA App Registration** - For the React frontend

## 1. Register API Application

### Create API App Registration

1. Navigate to Azure Portal > Entra ID > App registrations
2. Click "New registration"
3. Configure:
   - Name: `CoreComply API`
   - Supported account types: Accounts in this organizational directory only
   - Redirect URI: Leave blank (API doesn't need redirect)
   - Click "Register"

### Note the API IDs

Save these values:
- API Application (client) ID - This is `aad_api_client_id` for Terraform
- Directory (tenant) ID

## 2. Register Web/SPA Application

### Create Web App Registration

1. Navigate to Azure Portal > Entra ID > App registrations
2. Click "New registration"
3. Configure:
   - Name: `CoreComply Web`
   - Supported account types: Accounts in this organizational directory only
   - Redirect URI: 
     - Type: Single-page application (SPA)
     - URI: `https://<your-cdn-endpoint>.azureedge.net`
   - Click "Register"

### Note the Web IDs

Save these values:
- Web Application (client) ID - This is `aad_web_client_id` for Terraform
- Directory (tenant) ID (same as API)

## 2. Configure Authentication

### Add Redirect URIs

1. Go to "Authentication" in your app registration
2. Add redirect URIs:
   - `https://<your-cdn-endpoint>.azureedge.net`
   - `https://<your-storage-account>.z26.web.core.windows.net` (for testing)
   - `http://localhost:3000` (for local development)

### Enable Implicit Grant

Under "Implicit grant and hybrid flows", enable:
- ✅ Access tokens
- ✅ ID tokens

### Configure Token Settings

1. Set "Front-channel logout URL": `https://<your-cdn-endpoint>.azureedge.net/logout`
2. Advanced settings:
   - Allow public client flows: No
   - Supported account types: Single tenant

## 3. Expose an API

### Add Application ID URI

1. Go to "Expose an API"
2. Set Application ID URI: `api://corecomply`
3. Click "Save"

### Add Scopes

Add a scope:
- Scope name: `access_as_user`
- Who can consent: Admins and users
- Admin consent display name: `Access CoreComply as a user`
- Admin consent description: `Allows the app to access CoreComply API as the signed-in user`
- State: Enabled

### Add Authorized Client Applications

Add the web app as an authorized client:
- Client ID: `<your-app-client-id>`
- Authorized scopes: `api://corecomply/access_as_user`

## 4. API Permissions

### Add Microsoft Graph Permissions

1. Go to "API permissions"
2. Add permission > Microsoft Graph > Delegated permissions
3. Select:
   - User.Read (should already be there)
   - Email
   - Profile
4. Click "Add permissions"
5. Click "Grant admin consent for <organization>"

### Add API Permission

1. Add permission > My APIs > CoreComply MVP
2. Select delegated permission: `access_as_user`
3. Click "Add permissions"

## 5. Configure API App Service Authentication

### Enable App Service Authentication

1. Navigate to your API App Service in Azure Portal
2. Go to "Authentication" under Settings
3. Click "Add identity provider"
4. Select "Microsoft"
5. Configure:
   - App registration type: Pick an existing app registration
   - Application (client) ID: `<your-app-client-id>`
   - Client secret: Create new or use existing
   - Issuer URL: `https://login.microsoftonline.com/<tenant-id>/v2.0`
   - Allowed token audiences: `api://corecomply`
   - Restrict access: Require authentication
   - Unauthenticated requests: HTTP 401 Unauthorized

## 6. User Assignment (Optional)

To restrict access to specific users:

1. Go to Entra ID > Enterprise applications
2. Find "CoreComply MVP"
3. Go to "Properties"
4. Set "User assignment required?" to "Yes"
5. Go to "Users and groups"
6. Assign users or groups who should have access

## 7. Testing Authentication

### Test Web Login

1. Navigate to `https://<your-cdn-endpoint>.azureedge.net`
2. Click "Sign in with Microsoft"
3. Verify redirect to Microsoft login
4. After login, verify redirect back to app

### Test API Authentication

```bash
# Get access token
TOKEN=$(az account get-access-token --resource api://corecomply --query accessToken -o tsv)

# Test API endpoint
curl -H "Authorization: Bearer $TOKEN" https://<api-app-name>.azurewebsites.net/api/frameworks
```

## Environment Variables

Update your configuration with these values:

### Web App (.env)
```
VITE_AAD_CLIENT_ID=<your-app-client-id>
VITE_AAD_TENANT_ID=<your-tenant-id>
VITE_API_BASE_URL=https://<api-app-name>.azurewebsites.net/api
```

### API App (App Settings)
```
AzureAd__TenantId=<your-tenant-id>
AzureAd__ClientId=<your-app-client-id>
```

## Troubleshooting

### "AADSTS50011: The redirect URI specified in the request does not match"

- Verify redirect URIs are correctly configured in app registration
- Ensure URIs match exactly (including trailing slashes)

### "AADSTS700016: Application not found in the directory"

- Verify client ID is correct
- Ensure app registration is in the correct tenant

### "Access token validation failure. Invalid audience"

- Verify API accepts audience `api://corecomply`
- Check Allowed token audiences in App Service authentication
