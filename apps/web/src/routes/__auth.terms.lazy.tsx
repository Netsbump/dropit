import { createLazyFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Button } from '../shared/components/ui/button';

export const Route = createLazyFileRoute('/__auth/terms')({
  component: Terms,
});

function Terms() {
  return (
    <div className="container max-w-3xl py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: June 2023
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>
            Welcome to Dropit. By using our service, you agree to these Terms of
            Service. Please read them carefully.
          </p>

          <h2 className="text-xl font-semibold">2. Using our Service</h2>
          <p>
            You must follow any policies made available to you within the
            Service. You may use our Service only as permitted by law. We may
            suspend or stop providing our Service to you if you do not comply
            with our terms or policies or if we are investigating suspected
            misconduct.
          </p>

          <h2 className="text-xl font-semibold">3. Your Account</h2>
          <p>
            You may need an account to use some of our Services. You are
            responsible for maintaining the security of your account and
            password. We cannot and will not be liable for any loss or damage
            from your failure to comply with this security obligation.
          </p>

          <h2 className="text-xl font-semibold">
            4. Privacy and Copyright Protection
          </h2>
          <p>
            Our privacy policies explain how we treat your personal data and
            protect your privacy when you use our Services. By using our
            Services, you agree that we can use such data in accordance with our
            privacy policies.
          </p>

          <h2 className="text-xl font-semibold">
            5. Modifying and Terminating our Services
          </h2>
          <p>
            We are constantly changing and improving our Services. We may add or
            remove functionalities or features, and we may suspend or stop a
            Service altogether.
          </p>

          <h2 className="text-xl font-semibold">
            6. Our Warranties and Disclaimers
          </h2>
          <p>
            We provide our Services using a commercially reasonable level of
            skill and care, but there are certain things that we don't promise
            about our Services.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link to="/login">Back to Login</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
