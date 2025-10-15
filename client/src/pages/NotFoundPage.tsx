import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Page Not Found</h1>
            <p className="text-muted-foreground mt-2">
              The page you're looking for doesn't exist or you don't have permission to access it.
            </p>
          </div>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/">Return to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}