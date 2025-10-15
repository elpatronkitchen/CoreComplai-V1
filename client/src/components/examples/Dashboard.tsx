import Dashboard from '../Dashboard';
import { useAppStore } from '@/lib/store';

export default function DashboardExample() {
  const { users, setCurrentUser } = useAppStore();
  
  // Set a default user for the example
  if (users.length > 0 && !useAppStore.getState().currentUser) {
    setCurrentUser(users[1]); // Ava Morgan - Compliance Owner
  }

  return <Dashboard />;
}