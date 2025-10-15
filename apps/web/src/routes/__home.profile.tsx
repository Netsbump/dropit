import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/hooks/use-toast';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/__home/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();

  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Appeler directement l'API pour se déconnecter
      // Avec credentials: 'include', les cookies seront automatiquement envoyés
      await authClient.signOut();

      // Rediriger vers la page de connexion
      toast({
        title: 'Logout successful',
        description: 'You have been logged out successfully',
      });

      navigate({ to: '/', replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);

      toast({
        title: 'Logout issue',
        description:
          'You have been logged out but there was an issue contacting the server',
        variant: 'destructive',
      });

      navigate({ to: '/', replace: true });
    }
  };

  return (
    <div className="p-8">
      <div>Hello</div>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  )
}
