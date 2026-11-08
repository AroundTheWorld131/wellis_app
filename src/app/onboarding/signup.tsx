import { EmailPasswordScreen } from '@/components/email-password-screen';

// Convex Auth's Password provider needs at least 8 characters for a new account.
const MIN_PASSWORD_LENGTH = 8;

export default function SignupScreen() {
  return (
    <EmailPasswordScreen
      flow="signUp"
      failureAlert={[
        'Could not create account',
        'This email may already have an account. Try logging in instead.',
      ]}
      passwordTitle="Create a password"
      passwordSubtitle={`Use at least ${MIN_PASSWORD_LENGTH} characters.`}
      isPasswordValid={(password) => password.length >= MIN_PASSWORD_LENGTH}
    />
  );
}
