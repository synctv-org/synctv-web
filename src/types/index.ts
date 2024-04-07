export interface RegForm {
  email: string;
  password: string;
}

export interface EmailRegForm extends RegForm {
  captcha: string;
}
