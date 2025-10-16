import { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  CheckCheck
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Notification } from '@shared/schema';

export default function NotificationDropdown() {
  const { 
    notifications, 
    markNotificationRead, 
    clearNotifications 
  } = useAppStore();

  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = (notificationId: string) => {
    markNotificationRead(notificationId);
  };

  const handleMarkAllRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationRead(notification.id);
      }
    });
  };

  const handleClearAll = () => {
    clearNotifications();
    setOpen(false);
  };

  const getNotificationIcon = (type: string, notification?: Notification) => {
    // Check if it's a task assignment notification
    if (notification?.metadata?.taskId) {
      return <CheckCircle className="h-4 w-4 text-purple-600" />;
    }
    
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative" 
          data-testid="button-notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-2">
          <DropdownMenuLabel className="text-sm font-semibold">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {unreadCount} new
              </Badge>
            )}
          </DropdownMenuLabel>
          
          {notifications.length > 0 && (
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="h-6 px-2 text-xs"
                  data-testid="button-mark-all-read"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-6 px-2 text-xs"
                data-testid="button-clear-all"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-64">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3 p-3 cursor-pointer ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                }`}
                onClick={() => handleMarkRead(notification.id)}
                data-testid={`notification-${notification.id}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type, notification)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                    {notification.title}
                  </div>
                  {notification.message && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-muted-foreground">
                      {formatTime(notification.timestamp)}
                    </div>
                    {notification.metadata?.taskId && (
                      <div className="text-xs text-purple-600 font-medium">
                        Task Assignment
                      </div>
                    )}
                    {notification.metadata?.dueDate && (
                      <div className="text-xs text-orange-600">
                        Due: {new Date(notification.metadata.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}