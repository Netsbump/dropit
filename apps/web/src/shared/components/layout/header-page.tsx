export function HeaderPage({ title, description }: { title: string; description: string }) {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            <p className="text-sm text-muted-foreground mb-6">
                {description}
            </p>
        </div>
  );
}
