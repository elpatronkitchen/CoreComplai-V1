import { PublicClientApplication, Configuration, LogLevel } from '@azure/msal-browser'

const b2cPolicies = {
  names: {
    signUpSignIn: import.meta.env.VITE_B2C_POLICY_SIGNIN || 'B2C_1_signupsignin',
    forgotPassword: import.meta.env.VITE_B2C_POLICY_RESET || 'B2C_1_passwordreset',
    editProfile: import.meta.env.VITE_B2C_POLICY_EDIT || 'B2C_1_profileedit',
  },
  authorities: {
    signUpSignIn: {
      authority: `https://${import.meta.env.VITE_B2C_TENANT_NAME}.b2clogin.com/${import.meta.env.VITE_B2C_TENANT_NAME}.onmicrosoft.com/${import.meta.env.VITE_B2C_POLICY_SIGNIN || 'B2C_1_signupsignin'}`,
    },
    forgotPassword: {
      authority: `https://${import.meta.env.VITE_B2C_TENANT_NAME}.b2clogin.com/${import.meta.env.VITE_B2C_TENANT_NAME}.onmicrosoft.com/${import.meta.env.VITE_B2C_POLICY_RESET || 'B2C_1_passwordreset'}`,
    },
    editProfile: {
      authority: `https://${import.meta.env.VITE_B2C_TENANT_NAME}.b2clogin.com/${import.meta.env.VITE_B2C_TENANT_NAME}.onmicrosoft.com/${import.meta.env.VITE_B2C_POLICY_EDIT || 'B2C_1_profileedit'}`,
    },
  },
  authorityDomain: `${import.meta.env.VITE_B2C_TENANT_NAME}.b2clogin.com`,
}

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_B2C_CLIENT_ID || '',
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    knownAuthorities: [b2cPolicies.authorityDomain],
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Warning:
            console.warn(message)
            return
          case LogLevel.Info:
            console.info(message)
            return
          case LogLevel.Verbose:
            console.debug(message)
            return
        }
      },
    },
  },
}

export const msalInstance = new PublicClientApplication(msalConfig)

export const loginRequest = {
  scopes: ['openid', 'profile', 'offline_access'],
}

export const apiRequest = {
  scopes: [import.meta.env.VITE_API_SCOPE || 'https://corecomply.onmicrosoft.com/api/access_as_user'],
}

export { b2cPolicies }
