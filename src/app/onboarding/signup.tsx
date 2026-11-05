import { EmailPasswordScreen } from '@/components/email-password-screen';

const MIN_PASSWORD_LENGTH = 8;

export default function SignupScreen() {
  return (
    <EmailPasswordScreen
      passwordTitle="Choose a password"
      passwordSubtitle={`Your password must be at least\n${MIN_PASSWORD_LENGTH} characters or more.`}
      isPasswordValid={(password) => password.length >= MIN_PASSWORD_LENGTH}
    />
  );
}
