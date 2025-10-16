import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Users,
  User
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';
import TaskAssignmentModal from './TaskAssignmentModal';
import { FairWorkApiService, ATOApiService } from '@/lib/fairWorkApi';

// Task types for different categories
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  type: 'payroll' | 'compliance' | 'evidence' | 'audit' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignee?: string;
  assignedBy?: string;
  category: 'pre_payroll' | 'post_payroll' | 'monthly' | 'quarterly' | 'annual' | 'ongoing';
  recurring?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual';
    nextDue?: Date;
  };
  source?: 'fair_work' | 'ato' | 'internal' | 'compliance';
  metadata?: {
    payrollCycle?: string;
    awardType?: string;
    submissionType?: string;
    amount?: number;
  };
}

// Mock payroll compliance tasks
const generatePayrollTasks = (): Task[] => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Helper to create dates
  const createDate = (day: number, monthOffset: number = 0) => 
    new Date(currentYear, currentMonth + monthOffset, day);

  return [
    // Pre-payroll tasks
    {
      id: 'pre-1',
      title: 'Review Timesheet Submissions',
      description: 'Verify all employee timesheets are submitted and approved',
      dueDate: createDate(25),
      type: 'payroll',
      priority: 'high',
      status: 'pending',
      assignee: 'Leo Carter',
      assignedBy: 'Ava Morgan',
      category: 'pre_payroll',
      recurring: { frequency: 'monthly', nextDue: createDate(25, 1) }
    },
    {
      id: 'pre-2',
      title: 'Upload Payroll Evidence',
      description: 'Upload payroll processing documentation for compliance audit trail',
      dueDate: createDate(27),
      type: 'evidence',
      priority: 'medium',
      status: 'pending',
      assignee: 'Leo Carter',
      assignedBy: 'Ava Morgan',
      category: 'pre_payroll',
      recurring: { frequency: 'monthly', nextDue: createDate(27, 1) }
    },
    {
      id: 'pre-3',
      title: 'Verify Award Rate Compliance',
      description: 'Check current award rates against Fair Work database',
      dueDate: createDate(26),
      type: 'compliance',
      priority: 'critical',
      status: 'in_progress',
      assignee: 'Mia Nguyen',
      assignedBy: 'Ava Morgan',
      category: 'pre_payroll',
      source: 'fair_work',
      metadata: { awardType: 'Modern Award MA000001' }
    },

    // Post-payroll tasks
    {
      id: 'post-1',
      title: 'Submit PAYG Withholding',
      description: 'Submit PAYG withholding amounts to ATO',
      dueDate: createDate(28),
      type: 'compliance',
      priority: 'critical',
      status: 'pending',
      assignee: 'Ella Thompson',
      assignedBy: 'Ava Morgan',
      category: 'post_payroll',
      source: 'ato',
      recurring: { frequency: 'monthly', nextDue: createDate(28, 1) }
    },
    {
      id: 'post-2',
      title: 'Upload Payroll Register',
      description: 'Upload completed payroll register as evidence',
      dueDate: createDate(30),
      type: 'evidence',
      priority: 'medium',
      status: 'pending',
      assignee: 'Leo Carter',
      assignedBy: 'Ava Morgan',
      category: 'post_payroll',
      recurring: { frequency: 'monthly', nextDue: createDate(30, 1) }
    },

    // Quarterly obligations
    {
      id: 'quarterly-1',
      title: 'BAS Lodgement Due',
      description: 'Business Activity Statement lodgement with ATO',
      dueDate: new Date(2024, 2, 28), // March 28
      type: 'compliance',
      priority: 'critical',
      status: 'pending',
      assignee: 'Ella Thompson',
      assignedBy: 'Ava Morgan',
      category: 'quarterly',
      source: 'ato',
      recurring: { frequency: 'quarterly' }
    },
    {
      id: 'quarterly-2',
      title: 'Superannuation Guarantee Payment',
      description: 'Pay superannuation guarantee contributions',
      dueDate: new Date(2024, 2, 28),
      type: 'payroll',
      priority: 'critical',
      status: 'pending',
      assignee: 'Ella Thompson',
      assignedBy: 'Ava Morgan',
      category: 'quarterly',
      source: 'ato',
      metadata: { amount: 12750.50 }
    },

    // Annual Fair Work obligations
    {
      id: 'annual-1',
      title: 'Annual Wage Review Implementation',
      description: 'Implement new minimum wage rates from Fair Work Commission',
      dueDate: new Date(2024, 6, 1), // July 1
      type: 'compliance',
      priority: 'critical',
      status: 'pending',
      assignee: 'Mia Nguyen',
      assignedBy: 'Ava Morgan',
      category: 'annual',
      source: 'fair_work',
      metadata: { awardType: 'National Minimum Wage' }
    },
    {
      id: 'annual-2',
      title: 'Update Payroll System - Award Rates',
      description: 'Update payroll system with new award rates effective July 1',
      dueDate: new Date(2024, 5, 30), // June 30
      type: 'payroll',
      priority: 'high',
      status: 'pending',
      assignee: 'Leo Carter',
      assignedBy: 'Ava Morgan',
      category: 'annual',
      source: 'fair_work'
    },

    // Evidence uploads
    {
      id: 'evidence-1',
      title: 'Upload PAYG Payment Evidence',
      description: 'Upload PAYG payment confirmation from ATO',
      dueDate: createDate(31),
      type: 'evidence',
      priority: 'medium',
      status: 'pending',
      assignee: 'Ella Thompson',
      assignedBy: 'Ava Morgan',
      category: 'ongoing'
    }
  ];
};

export default function Calendar() {
  const { currentUser, addNotification, activeFramework, frameworks } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');
  const [frameworkFilter, setFrameworkFilter] = useState<string>(activeFramework || "apgf-ms");

  // Combined tasks from multiple sources
  const [fairWorkTasks, setFairWorkTasks] = useState<Task[]>([]);
  const [atoTasks, setAtoTasks] = useState<Task[]>([]);
  const [currentMinWage, setCurrentMinWage] = useState<{ rate: number; effectiveDate: string } | null>(null);
  const [complianceEvents, setComplianceEvents] = useState<any[]>([]);

  // Load external compliance data
  useEffect(() => {
    const loadComplianceData = async () => {
      try {
        // Load Fair Work compliance tasks
        const fwTasks = await FairWorkApiService.getPayrollComplianceTasks();
        setFairWorkTasks(fwTasks);

        // Load ATO compliance dates
        const atoDates = await ATOApiService.getComplianceDates();
        setAtoTasks(atoDates);

        // Load current minimum wage
        const minWage = await FairWorkApiService.getCurrentMinimumWage();
        setCurrentMinWage(minWage);

        // Load upcoming compliance events
        const events = await FairWorkApiService.getUpcomingComplianceEvents();
        setComplianceEvents(events);
      } catch (error) {
        console.error('Failed to load compliance data:', error);
        addNotification({
          title: 'Compliance Data Error',
          message: 'Failed to load Fair Work and ATO compliance data',
          type: 'warning',
          timestamp: new Date().toISOString(),
          read: false
        });
      }
    };

    loadComplianceData();
  }, [addNotification]);

  // Combine all tasks
  const localTasks = generatePayrollTasks();
  const tasks = [...localTasks, ...fairWorkTasks, ...atoTasks];

  // Filter tasks by current user
  const myTasks = tasks.filter(task => task.assignee === currentUser?.name);
  const allTasks = hasPermission(currentUser, 'manage_users') ? tasks : myTasks;

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
      .filter(task => task.dueDate <= nextWeek && task.status !== 'completed')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [allTasks]);

  // Get overdue tasks
  const overdueTasks = useMemo(() => {
    const now = new Date();
    return allTasks.filter(task => task.dueDate < now && task.status !== 'completed');
  }, [allTasks]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleTaskComplete = (taskId: string) => {
    // In real app, update task status
    addNotification({
      title: 'Task Completed',
      message: 'Task has been marked as completed',
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Get framework name for display */}
      {(() => {
        const selectedFramework = frameworks.find(f => f.id === frameworkFilter);
        const frameworkName = selectedFramework?.name || "APGF-MS";
        const frameworkDesc = selectedFramework?.description || "Australian Payroll Governance Management System Framework";
        
        return (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Calendar & Tasks</h1>
              <p className="text-muted-foreground">
                {frameworkDesc} ({frameworkName}) - Task Management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
                <SelectTrigger className="w-48" data-testid="select-framework">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frameworks.map(framework => (
                    <SelectItem key={framework.id} value={framework.id}>
                      {framework.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button data-testid="button-create-task">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
              <TaskAssignmentModal 
                task={{
                  id: 'quick-assign',
                  title: 'Quick Task Assignment',
                  description: 'Assign a quick task to a team member',
                  dueDate: new Date(),
                  type: 'general',
                  priority: 'medium'
                }}
                trigger={
                  <Button variant="outline">
                    <User className="mr-2 h-4 w-4" />
                    Assign Task
                  </Button>
                }
              />
            </div>
          </div>
        );
      })()}

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{myTasks.length}</div>
            <p className="text-xs text-muted-foreground">My Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{upcomingTasks.length}</div>
            <p className="text-xs text-muted-foreground">Due This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {allTasks.filter(t => t.source === 'fair_work' || t.source === 'ato').length}
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
                  <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
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
                  const hasHighPriorityTasks = dayTasks.some(t => t.priority === 'critical' || t.priority === 'high');
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-20 p-1 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                        !isCurrentMonth ? 'text-muted-foreground bg-muted/20' : ''
                      } ${isToday ? 'bg-primary/10 border-primary' : ''}`}
                      onClick={() => setSelectedDate(day)}
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
                      Due: {task.dueDate.toLocaleDateString()}
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
                    <TaskAssignmentModal 
                      task={task}
                      trigger={
                        <Button size="sm" variant="ghost">
                          <Users className="w-4 h-4" />
                        </Button>
                      }
                      onAssignmentComplete={() => {
                        addNotification({
                          title: 'Task Reassigned',
                          message: `${task.title} has been reassigned`,
                          type: 'info',
                          timestamp: new Date().toISOString(),
                          read: false
                        });
                      }}
                    />
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleTaskComplete(task.id)}
                      data-testid={`complete-task-${task.id}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payroll Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payroll Schedule</CardTitle>
              <CardDescription>Next payroll cycle information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Next Payroll</div>
                  <div className="text-xs text-muted-foreground">Monthly cycle</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">
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

          {/* Fair Work & ATO Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance Updates</CardTitle>
              <CardDescription>Latest from Fair Work & ATO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentMinWage && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-sm">Current Minimum Wage</div>
                  <div className="text-lg font-bold text-blue-600">
                    ${currentMinWage.rate}/hour
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Effective: {new Date(currentMinWage.effectiveDate).toLocaleDateString()}
                  </div>
                </div>
              )}
              
              {complianceEvents.slice(0, 2).map(event => (
                <div key={event.id} className="p-2 border rounded">
                  <div className="text-sm font-medium">{event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </div>
                  <Badge 
                    className={`text-xs mt-1 ${
                      event.priority === 'critical' ? 'bg-red-100 text-red-800' : 
                      event.priority === 'high' ? 'bg-orange-100 text-orange-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {event.source.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Compliance Alerts */}
          {overdueTasks.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-base text-red-600">Overdue Tasks</CardTitle>
                <CardDescription>Tasks requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {overdueTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{task.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Due: {task.dueDate.toLocaleDateString()}
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