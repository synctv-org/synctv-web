export interface RegForm {
  username?: string;
  email?: string;
  password: string;
}

export interface EmailRegForm extends RegForm {
  captcha: string;
}

export interface PublicSettings {
  passwordDisableSignup: boolean;

  emailEnable: boolean;
  emailDisableSignup: boolean;
  emailWhitelistEnabled: boolean;
  emailWhitelist: string[];

  oauth2DisableSignup: boolean;

  guestEnable: boolean;
}
