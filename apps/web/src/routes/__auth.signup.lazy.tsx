import { authClient } from '@/lib/auth-client';
import { toast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Github } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../shared/components/ui/form';
import { Input } from '../shared/components/ui/input';
import { Separator } from '../shared/components/ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
  name: z.string().min(1, { message: 'Name is required.' }),
});

type SignupFormData = z.infer<typeof formSchema>;

export const Route = createLazyFileRoute('/__auth/signup')({
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (values: SignupFormData) => {
      const response = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: '/',
      });

      if (response.error) {
        throw new Error(response.error.message || 'Invalid email or password');
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Account created successfully',
        description: 'The account has been created successfully',
      });
      navigate({ to: '/dashboard', replace: true });
    },
    onError: (error) => {
      toast({
        title: 'Signup failed',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: SignupFormData) {
    signupMutation.mutate(values);
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending
                ? 'Creating account...'
                : 'Sign Up with Email'}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button variant="outline" type="button" className="w-full">
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </p>

        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{' '}
          <Link
            to="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            to="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
