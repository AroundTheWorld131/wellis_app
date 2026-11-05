import { EmailPasswordScreen } from '@/components/email-password-screen';

export default function LoginScreen() {
  return (
    <EmailPasswordScreen
      passwordTitle="Enter your password"
      passwordSubtitle="Use your account password to log in."
      isPasswordValid={(password) => password.length > 0}
    />
  );
}
