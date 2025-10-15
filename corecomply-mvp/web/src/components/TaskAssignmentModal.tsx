import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarIcon, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { TaskAssignmentService } from '@/lib/fairWorkApi';

interface TaskAssignmentModalProps {
  task?: {
    id: string;
    title: string;
    description?: string;
    dueDate: Date;
    type: string;
    priority: string;
  };
  trigger?: React.ReactNode;
  onAssignmentComplete?: () => void;
}

export default function TaskAssignmentModal({ task, trigger, onAssignmentComplete }: TaskAssignmentModalProps) {
  const { users, currentUser, addNotification } = useAppStore();
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [open, setOpen] = useState(false);

  // Filter users who can be assigned tasks (exclude current user)
  const availableAssignees = users.filter(user => user.id !== currentUser?.id);

  const handleAssignTask = async () => {
    if (!selectedAssignee || !task) return;

    setIsAssigning(true);
    try {
      // Find selected user
      const assignee = users.find(u => u.id === selectedAssignee);
      if (!assignee) return;

      // Create task assignment
      await TaskAssignmentService.assignTask(task.id, selectedAssignee, currentUser?.id || '');

      // Create notification for assignee
      const notification = await TaskAssignmentService.createTaskAssignmentNotification(
        { ...task, assignedBy: currentUser?.name },
        assignee.name
      );

      // Add custom message if provided
      if (customMessage) {
        notification.message += `\n\nNote: ${customMessage}`;
      }

      addNotification(notification);

      // Success notification for assigner
      addNotification({
        title: 'Task Assigned Successfully',
        message: `${task.title} has been assigned to ${assignee.name}`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });

      // Reset form and close modal
      setSelectedAssignee('');
      setCustomMessage('');
      setOpen(false);
      onAssignmentComplete?.();

    } catch (error) {
      console.error('Failed to assign task:', error);
      addNotification({
        title: 'Assignment Failed',
        message: 'Failed to assign task. Please try again.',
        type: 'error',
        timestamp: new Date().toISOString(),
        read: false
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <User className="w-4 h-4 mr-2" />
            Assign Task
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>
            Assign this task to a team member and they will receive a notification
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Task Details */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium">{task.title}</h4>
              <div className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </div>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                Due: {task.dueDate.toLocaleDateString()}
              </div>
              <div className="capitalize">
                {task.type} task
              </div>
            </div>
          </div>

          {/* Assignee Selection */}
          <div className="space-y-2">
            <Label htmlFor="assignee">Assign to:</Label>
            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {availableAssignees.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">
                        {user.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.role.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Additional message (optional):</Label>
            <Textarea
              id="message"
              placeholder="Add any specific instructions or context for this assignment..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-assignment">
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTask} 
              disabled={!selectedAssignee || isAssigning}
              className="min-w-24"
              data-testid="button-confirm-assignment"
            >
              {isAssigning ? 'Assigning...' : 'Assign Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}