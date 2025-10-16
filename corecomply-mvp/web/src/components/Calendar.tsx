import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  FileText,
  User,
  Loader2
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useApiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ComplianceTask } from '@/types/task';

export default function Calendar() {
  const { user } = useUser();
  const apiClient = useApiClient();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch tasks for current month
  const { data: tasks = [], isLoading, error } = useQuery<ComplianceTask[]>({
    queryKey: ['/api/tasks/calendar', currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: async () => {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const response = await apiClient.get(`/api/tasks/calendar?month=${month.toISOString()}`);
      return response.data;
    }
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiClient.put(`/api/tasks/${taskId}/complete`);
    },
    onSuccess: () => {
      // Invalidate all calendar queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/calendar'], exact: false });
      toast({
        title: 'Success',
        description: 'Task marked as completed',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to complete task',
        variant: 'destructive',
      });
    }
  });

  // Backend API already filters tasks by user permissions, so use all returned tasks
  const allTasks = tasks;
  const myTasks = tasks.filter(task => task.assignee === user?.username);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return allTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // Get upcoming tasks (next 7 days)
  const upcomingTasks = useMemo(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return allTasks
      .filter(task => new Date(task.dueDate) <= nextWeek && task.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [allTasks]);

  // Get overdue tasks
  const overdueTasks = useMemo(() => {
    const now = new Date();
    return allTasks.filter(task => new Date(task.dueDate) < now && task.status !== 'completed');
  }, [allTasks]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleTaskComplete = (taskId: number) => {
    completeTaskMutation.mutate(taskId);
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'payroll':
        return <DollarSign className="w-4 h-4" />;
      case 'compliance':
        return <AlertTriangle className="w-4 h-4" />;
      case 'evidence':
        return <FileText className="w-4 h-4" />;
      case 'audit':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 6 weeks

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar & Tasks</h1>
            <p className="text-muted-foreground">
              Manage payroll schedules, compliance deadlines, and task assignments
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load tasks</h3>
              <p className="text-sm text-muted-foreground mb-4">
                There was an error loading the calendar tasks
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/tasks/calendar'] })}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar & Tasks</h1>
            <p className="text-muted-foreground">
              Manage payroll schedules, compliance deadlines, and task assignments
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading calendar...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar & Tasks</h1>
          <p className="text-muted-foreground">
            Manage payroll schedules, compliance deadlines, and task assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button data-testid="button-create-task">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
          <Button variant="outline">
            <User className="mr-2 h-4 w-4" />
            Assign Task
          </Button>
        </div>
      </div>

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-my-tasks">{myTasks.length}</div>
            <p className="text-xs text-muted-foreground">My Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600" data-testid="stat-upcoming">{upcomingTasks.length}</div>
            <p className="text-xs text-muted-foreground">Due This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600" data-testid="stat-overdue">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600" data-testid="stat-compliance">
              {allTasks.filter(t => t.type === 'compliance').length}
            </div>
            <p className="text-xs text-muted-foreground">Compliance Tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousMonth} data-testid="button-prev-month">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextMonth} data-testid="button-next-month">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = day.toDateString() === new Date().toDateString();
                  const dayTasks = getTasksForDate(day);
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-20 p-1 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                        !isCurrentMonth ? 'text-muted-foreground bg-muted/20' : ''
                      } ${isToday ? 'bg-primary/10 border-primary' : ''}`}
                      data-testid={`calendar-day-${day.getDate()}`}
                    >
                      <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                        {day.getDate()}
                      </div>
                      
                      {dayTasks.length > 0 && (
                        <div className="space-y-1 mt-1">
                          {dayTasks.slice(0, 2).map(task => (
                            <div 
                              key={task.id}
                              className={`text-xs p-1 rounded truncate ${getPriorityColor(task.priority)}`}
                            >
                              {task.title.substring(0, 15)}...
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayTasks.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Sidebar */}
        <div className="space-y-4">
          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Tasks</CardTitle>
              <CardDescription>Tasks due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {getTaskTypeIcon(task.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                      {task.source && (
                        <Badge variant="outline" className="text-xs">
                          {task.source.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleTaskComplete(task.id)}
                      disabled={completeTaskMutation.isPending}
                      data-testid={`complete-task-${task.id}`}
                    >
                      {completeTaskMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
              {upcomingTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming tasks
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payroll Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payroll Schedule</CardTitle>
              <CardDescription>Next payroll cycle information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Next Payroll</div>
                  <div className="text-xs text-muted-foreground">Monthly cycle</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    {new Date(currentDate.getFullYear(), currentDate.getMonth(), 28).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Pay date</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Timesheet cutoff:</span>
                  <span>{new Date(currentDate.getFullYear(), currentDate.getMonth(), 25).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pay run processing:</span>
                  <span>{new Date(currentDate.getFullYear(), currentDate.getMonth(), 26).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>PAYG submission:</span>
                  <span>{new Date(currentDate.getFullYear(), currentDate.getMonth(), 28).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Alerts */}
          {overdueTasks.length > 0 && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-base text-red-600 dark:text-red-400">Overdue Tasks</CardTitle>
                <CardDescription>Tasks requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {overdueTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{task.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
