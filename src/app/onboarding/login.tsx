import { EmailPasswordScreen } from '@/components/email-password-screen';

export default function LoginScreen() {
  return (
    <EmailPasswordScreen
      flow="signIn"
      failureAlert={['Could not log in', 'Check your email and password and try again.']}
      passwordTitle="Enter your password"
      passwordSubtitle="Use your account password to log in."
      isPasswordValid={(password) => password.length > 0}
    />
  );
}
