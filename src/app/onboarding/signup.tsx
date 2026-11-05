import { EmailPasswordScreen } from '@/components/email-password-screen';

// Get Started sends people who already have an account here, so it reads the same as login.
export default function SignupScreen() {
  return (
    <EmailPasswordScreen
      passwordTitle="Enter your password"
      passwordSubtitle="Use your account password to log in."
      isPasswordValid={(password) => password.length > 0}
    />
  );
}
