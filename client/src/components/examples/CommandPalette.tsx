import CommandPalette from '../CommandPalette';
import { useAppStore } from '@/lib/store';

export default function CommandPaletteExample() {
  const { users, setCurrentUser } = useAppStore();
  
  // Set a default user for the example
  if (users.length > 0 && !useAppStore.getState().currentUser) {
    setCurrentUser(users[0]); // Harper Lane - System Admin
  }

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Command Palette Example</h3>
      <p className="text-sm text-muted-foreground">
        Press <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd> or <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+K</kbd> to open the command palette
      </p>
      <CommandPalette />
    </div>
  );
}