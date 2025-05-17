import { createLazyFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Button } from '../shared/components/ui/button';

export const Route = createLazyFileRoute('/__auth/privacy')({
  component: Privacy,
});

function Privacy() {
  return (
    <div className="container max-w-3xl py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: June 2023
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>
            We collect information to provide better services to all our users.
            The information we collect includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Information you provide to us (such as your name, email address,
              and password)
            </li>
            <li>
              Information we get from your use of our services (such as device
              information and log information)
            </li>
          </ul>

          <h2 className="text-xl font-semibold">2. How We Use Information</h2>
          <p>
            We use the information we collect to provide, maintain, protect, and
            improve our services, and to develop new ones. We may also use this
            information to offer you tailored content.
          </p>

          <h2 className="text-xl font-semibold">3. Information We Share</h2>
          <p>
            We do not share personal information with companies, organizations,
            and individuals outside of our company unless one of the following
            circumstances applies:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>With your consent</li>
            <li>For legal reasons</li>
            <li>With domain administrators</li>
          </ul>

          <h2 className="text-xl font-semibold">4. Information Security</h2>
          <p>
            We work hard to protect our users from unauthorized access to or
            unauthorized alteration, disclosure, or destruction of information
            we hold.
          </p>

          <h2 className="text-xl font-semibold">5. Changes</h2>
          <p>
            Our Privacy Policy may change from time to time. We will post any
            privacy policy changes on this page and, if the changes are
            significant, we will provide a more prominent notice.
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
