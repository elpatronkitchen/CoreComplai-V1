import ControlsManager from '../ControlsManager';
import { useAppStore } from '@/lib/store';

export default function ControlsManagerExample() {
  const { users, setCurrentUser } = useAppStore();
  
  // Set a default user for the example
  if (users.length > 0 && !useAppStore.getState().currentUser) {
    setCurrentUser(users[1]); // Ava Morgan - Compliance Owner
  }

  return <ControlsManager />;
}