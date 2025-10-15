import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Check, AlertCircle, Download, Calendar } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { formatDistanceToNow } from 'date-fns';

export default function BillingPage() {
  const { subscription, updateSubscription } = useAppStore();

  // Mock invoice data for prototype
  const mockInvoices = [
    {
      id: 'INV-2024-001',
      date: new Date('2024-01-15'),
      amount: 1000,
      status: 'paid' as const,
      description: 'Monthly Subscription - January 2024',
    },
    {
      id: 'INV-2023-012',
      date: new Date('2023-12-15'),
      amount: 1000,
      status: 'paid' as const,
      description: 'Monthly Subscription - December 2023',
    },
    {
      id: 'INV-2023-011',
      date: new Date('2023-11-15'),
      amount: 1000,
      status: 'paid' as const,
      description: 'Monthly Subscription - November 2023',
    },
  ];

  const handlePlanSwitch = (plan: 'annual' | 'monthly') => {
    if (subscription?.plan !== plan) {
      updateSubscription(plan);
    }
  };

  const getTrialDaysRemaining = () => {
    if (!subscription?.trialEndsAt) {
      // If no trial end date but status is trialing, default to 15 days
      return subscription?.status === 'trialing' ? 15 : 0;
    }
    const now = new Date();
    const trialEnd = new Date(subscription.trialEndsAt);
    
    // Check if date is valid
    if (isNaN(trialEnd.getTime())) {
      return subscription?.status === 'trialing' ? 15 : 0;
    }
    
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  };

  const trialDaysRemaining = getTrialDaysRemaining();
  const isTrialing = subscription?.status === 'trialing';

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-billing">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription, billing information, and payment methods
          </p>
        </div>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle data-testid="title-subscription-status">Subscription Status</CardTitle>
                <CardDescription>
                  Your current plan and billing cycle
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isTrialing ? (
                  <Badge variant="default" className="bg-blue-600 hover:bg-blue-700" data-testid="badge-trial-status">
                    <Calendar className="h-3 w-3 mr-1" />
                    Trial: {trialDaysRemaining} days remaining
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700" data-testid="badge-active-status">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isTrialing && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg" data-testid="alert-trial-info">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      Free Trial Active
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      You have {trialDaysRemaining} days remaining in your 15-day trial. 
                      {subscription?.trialEndsAt && (() => {
                        const endDate = new Date(subscription.trialEndsAt);
                        return !isNaN(endDate.getTime()) ? ` No payment required until ${endDate.toLocaleDateString()}.` : '';
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Plan Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold">Select Your Plan</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Monthly Plan */}
                <Card 
                  className={`cursor-pointer hover-elevate active-elevate-2 transition-all ${
                    subscription?.plan === 'monthly' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handlePlanSwitch('monthly')}
                  data-testid="card-plan-monthly"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Monthly</CardTitle>
                      {subscription?.plan === 'monthly' && (
                        <Badge variant="default" data-testid="badge-current-plan">Current</Badge>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">$1,000</span>
                      <span className="text-muted-foreground ml-2">AUD/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        All compliance frameworks
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Unlimited users
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        AI-powered features
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        24/7 support
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Annual Plan */}
                <Card 
                  className={`cursor-pointer hover-elevate active-elevate-2 transition-all relative ${
                    subscription?.plan === 'annual' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handlePlanSwitch('annual')}
                  data-testid="card-plan-annual"
                >
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      Save $2,000
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Annual</CardTitle>
                      {subscription?.plan === 'annual' && (
                        <Badge variant="default" data-testid="badge-current-plan">Current</Badge>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">$10,000</span>
                      <span className="text-muted-foreground ml-2">AUD/year</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        All compliance frameworks
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Unlimited users
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        AI-powered features
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Priority support
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Dedicated account manager
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle data-testid="title-payment-method">Payment Method</CardTitle>
            <CardDescription>
              Manage your payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium" data-testid="text-card-info">Visa ending in 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                </div>
              </div>
              <Badge variant="outline" data-testid="badge-default-payment">Default</Badge>
            </div>
            <Button variant="outline" className="w-full" data-testid="button-add-payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card>
          <CardHeader>
            <CardTitle data-testid="title-invoice-history">Invoice History</CardTitle>
            <CardDescription>
              Download your past invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium" data-testid={`text-invoice-${invoice.id}`}>{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">${invoice.amount.toLocaleString()} AUD</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.date.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400">
                      Paid
                    </Badge>
                    <Button variant="ghost" size="icon" data-testid={`button-download-${invoice.id}`}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle data-testid="title-billing-info">Billing Information</CardTitle>
            <CardDescription>
              Update your billing address and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <p className="text-muted-foreground mt-1" data-testid="text-company-name">CoreComply Pty Ltd</p>
              </div>
              <div>
                <label className="text-sm font-medium">ABN</label>
                <p className="text-muted-foreground mt-1" data-testid="text-abn">12 345 678 901</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Billing Address</label>
                <p className="text-muted-foreground mt-1" data-testid="text-billing-address">
                  Level 5, 123 Compliance Street<br />
                  Sydney NSW 2000<br />
                  Australia
                </p>
              </div>
            </div>
            <Separator />
            <Button variant="outline" data-testid="button-update-billing">
              Update Billing Information
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
