export interface RegForm {
  email: string;
  password: string;
}

export interface EmailRegForm extends RegForm {
  captcha: string;
}

export interface PublicSettings {
  emailEnable: boolean;
  emailDisableUserSignup: boolean;
  emailWhitelistEnabled: boolean;
  emailWhitelist: string[];
  guestEnable: boolean;
}
