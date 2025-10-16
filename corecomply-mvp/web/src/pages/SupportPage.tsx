import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  FileText,
  Book,
  Video,
  Phone,
  Plus,
  Loader2,
  AlertTriangle,
  Search,
  Ticket
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useApiClient } from '@/lib/api-client';
import type { SupportTicket, KnowledgeBaseArticle } from '@/types/support';

export default function SupportPage() {
  const apiClient = useApiClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [kbCategory, setKbCategory] = useState<string>('all');

  // Fetch support tickets
  const {
    data: tickets = [],
    isLoading: loadingTickets,
    isError: errorTickets,
    refetch: refetchTickets
  } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support/tickets', filterStatus],
    queryFn: async () => {
      const params = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const response = await apiClient.get(`/api/support/tickets${params}`);
      return response.data;
    },
  });

  // Fetch knowledge base articles
  const {
    data: articles = [],
    isLoading: loadingArticles,
    isError: errorArticles,
    refetch: refetchArticles
  } = useQuery<KnowledgeBaseArticle[]>({
    queryKey: ['/api/support/knowledge-base', kbCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (kbCategory !== 'all') params.append('category', kbCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const url = `/api/support/knowledge-base${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    },
  });

  const supportChannels = [
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      action: 'Start Chat',
      badge: 'Available 9am-5pm AEST',
      badgeVariant: 'default' as const,
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message',
      action: 'support@corecomply.com.au',
      link: 'mailto:support@corecomply.com.au',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our team',
      action: '1300 COMPLY',
      badge: 'Business hours only',
      badgeVariant: 'secondary' as const,
    },
  ];

  const resources = [
    {
      icon: Book,
      title: 'Knowledge Base',
      description: 'Browse articles and guides',
      items: ['Getting Started', 'User Guides', 'Best Practices', 'Troubleshooting'],
      link: '#knowledge-base',
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step tutorials',
      items: ['Framework Setup', 'Control Management', 'Audit Workflows', 'Reporting'],
      link: '/tutorials',
    },
    {
      icon: FileText,
      title: 'Documentation',
      description: 'Technical documentation and API reference',
      items: ['API Reference', 'Integration Guides', 'Security', 'Compliance'],
      link: '/docs',
    },
  ];

  const faqs = [
    {
      question: 'How do I upload evidence for a control?',
      answer: 'Navigate to Controls, select the control, click "Add Evidence", and upload your files. Supported formats include PDF, Excel, images, and documents.',
    },
    {
      question: 'How long does CoreComply retain compliance records?',
      answer: 'All evidence and audit records are retained for 7 years in accordance with the Fair Work Act 2009 requirements.',
    },
    {
      question: 'Can I export audit reports?',
      answer: 'Yes, you can export audit reports in PDF, Excel, or CSV format from the Reports page or directly from any audit.',
    },
    {
      question: 'How do I add new users to the system?',
      answer: 'Go to Admin > Users and click "Add User". You can assign roles and permissions based on their responsibilities.',
    },
    {
      question: 'What integrations are supported?',
      answer: 'CoreComply integrates with Employment Hero, Xero Payroll, MYOB, Deputy, and more. Visit Integrations to connect your systems.',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'default';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'default';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-support">Support Center</h1>
          <p className="text-muted-foreground">
            Get help with CoreComply compliance management system
          </p>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList>
            <TabsTrigger value="info" data-testid="tab-support-info">
              <HelpCircle className="h-4 w-4 mr-2" />
              Support Info
            </TabsTrigger>
            <TabsTrigger value="tickets" data-testid="tab-my-tickets">
              <Ticket className="h-4 w-4 mr-2" />
              My Tickets
            </TabsTrigger>
            <TabsTrigger value="knowledge-base" data-testid="tab-knowledge-base">
              <Book className="h-4 w-4 mr-2" />
              Knowledge Base
            </TabsTrigger>
          </TabsList>

          {/* Support Info Tab */}
          <TabsContent value="info" className="mt-6 space-y-6">
            {/* Support Channels */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {supportChannels.map((channel) => (
                  <Card key={channel.title} className="hover-elevate" data-testid={`card-support-${channel.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <channel.icon className="h-8 w-8 text-primary" />
                        {channel.badge && (
                          <Badge variant={channel.badgeVariant || 'secondary'} className="text-xs">
                            {channel.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="mt-4">{channel.title}</CardTitle>
                      <CardDescription>{channel.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {channel.link ? (
                        <Button variant="outline" className="w-full" asChild data-testid={`button-${channel.title.toLowerCase().replace(/\s+/g, '-')}`}>
                          <a href={channel.link}>{channel.action}</a>
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" data-testid={`button-${channel.title.toLowerCase().replace(/\s+/g, '-')}`}>
                          {channel.action}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Learning Resources */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Learning Resources</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {resources.map((resource) => (
                  <Card key={resource.title} className="hover-elevate" data-testid={`card-resource-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardHeader>
                      <resource.icon className="h-8 w-8 text-primary mb-2" />
                      <CardTitle>{resource.title}</CardTitle>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {resource.items.map((item) => (
                          <li key={item} className="text-sm text-muted-foreground flex items-center">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={resource.link}>Browse</a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} data-testid={`card-faq-${index}`}>
                    <CardHeader>
                      <CardTitle className="text-base">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* My Tickets Tab */}
          <TabsContent value="tickets" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>My Support Tickets</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button data-testid="button-create-ticket">
                      <Plus className="h-4 w-4 mr-2" />
                      New Ticket
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingTickets ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading tickets...</span>
                  </div>
                ) : errorTickets ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Failed to load tickets. Please try again.</span>
                      <Button variant="outline" size="sm" onClick={() => refetchTickets()}>
                        Try Again
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : tickets.length > 0 ? (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <Card key={ticket.id} data-testid={`card-ticket-${ticket.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base" data-testid={`text-ticket-title-${ticket.id}`}>
                                {ticket.title}
                              </CardTitle>
                              <CardDescription className="mt-1">{ticket.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <Badge variant={getStatusColor(ticket.status)}>
                                {ticket.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div>Category: {ticket.category}</div>
                            <div>Created: {new Date(ticket.createdAt).toLocaleDateString()}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No support tickets found</p>
                    <Button variant="outline" className="mt-4" data-testid="button-create-first-ticket">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Ticket
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge-base" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>Knowledge Base</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={kbCategory} onValueChange={setKbCategory}>
                      <SelectTrigger className="w-[180px]" data-testid="select-filter-category">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="getting-started">Getting Started</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search articles..."
                        className="pl-10 w-80"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        data-testid="input-search-articles"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingArticles ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading articles...</span>
                  </div>
                ) : errorArticles ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Failed to load articles. Please try again.</span>
                      <Button variant="outline" size="sm" onClick={() => refetchArticles()}>
                        Try Again
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : articles.length > 0 ? (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <Card key={article.id} className="hover-elevate" data-testid={`card-article-${article.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base" data-testid={`text-article-title-${article.id}`}>
                                {article.title}
                              </CardTitle>
                              <CardDescription className="mt-2 line-clamp-2">
                                {article.content.substring(0, 150)}...
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{article.category}</Badge>
                              {article.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {article.viewCount} views
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No articles found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
