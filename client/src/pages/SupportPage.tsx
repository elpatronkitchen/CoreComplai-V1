import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  FileText, 
  ExternalLink,
  Book,
  Video,
  Users,
  Phone
} from 'lucide-react';
import { Link } from 'wouter';
import AppShell from '@/components/AppShell';

export default function SupportPage() {
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
      link: '/knowledge-base',
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

  return (
    <AppShell>
      <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-support">Support Center</h1>
        <p className="text-muted-foreground">
          Get help with CoreComply compliance management system
        </p>
      </div>

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

      {/* Resources */}
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
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  {resource.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" className="w-full mt-2" asChild data-testid={`button-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Link href={resource.link}>
                    Browse {resource.title} <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <Card data-testid="card-faqs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <CardTitle>Frequently Asked Questions</CardTitle>
          </div>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="space-y-2" data-testid={`faq-${index}`}>
              <h3 className="font-semibold text-sm">{faq.question}</h3>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
              {index < faqs.length - 1 && <div className="border-t mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card data-testid="card-system-status">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current status of CoreComply services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">CoreComply Platform</span>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">Operational</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">API Services</span>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">Operational</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Integrations</span>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">Operational</Badge>
          </div>
          <Button variant="ghost" className="w-full mt-4" asChild data-testid="button-status-page">
            <a href="https://status.corecomply.com.au" target="_blank" rel="noopener noreferrer">
              View Status Page <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Community */}
      <Card data-testid="card-community">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>Join the Community</CardTitle>
          </div>
          <CardDescription>Connect with other CoreComply users and compliance professionals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Join our community forum to share best practices, ask questions, and learn from other compliance professionals using CoreComply.
          </p>
          <Button variant="default" className="w-full" data-testid="button-join-community">
            Join Community Forum
          </Button>
        </CardContent>
      </Card>
    </div>
    </AppShell>
  );
}
