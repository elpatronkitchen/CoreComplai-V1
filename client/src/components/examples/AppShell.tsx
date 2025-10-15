import AppShell from '../AppShell';

export default function AppShellExample() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Welcome to CoreComply</h1>
        <p className="text-muted-foreground">
          This is an example of the main application shell with sidebar navigation, 
          top bar with search, notifications, and user menu.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Content Card {i + 1}</h3>
              <p className="text-sm text-muted-foreground">
                This demonstrates how content appears within the app shell layout.
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}