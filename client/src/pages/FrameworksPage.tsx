import { useAppStore } from '@/lib/store';
import AppShell from '@/components/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Shield, Sparkles, Lock } from 'lucide-react';

export default function FrameworksPage() {
  const { frameworks, purchasedFrameworks, purchaseFramework, purchaseBundle } = useAppStore();

  const handlePurchase = (frameworkId: string) => {
    // Simulated Stripe Checkout
    purchaseFramework(frameworkId);
  };

  const handleBundlePurchase = () => {
    // Simulated bundle purchase
    purchaseBundle();
  };

  const allFrameworksPurchased = frameworks.every(f => purchasedFrameworks.includes(f.id));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-frameworks">Framework Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Unlock additional compliance frameworks to expand your compliance coverage
          </p>
        </div>

        {/* Bundle Offer - Only show if not all frameworks are purchased */}
        {!allFrameworksPurchased && (
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Bundle Offer - Save $1,497!
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Get all 3 compliance frameworks and save 33%
                  </CardDescription>
                </div>
                <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-lg px-4 py-2">
                  Best Value
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 mb-6">
                <div>
                  <span className="text-4xl font-bold">$3,000</span>
                  <span className="text-muted-foreground ml-2">AUD one-time</span>
                </div>
                <div className="text-muted-foreground line-through mb-1">
                  $4,497 AUD
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3 mb-6">
                {frameworks.map(framework => (
                  <div key={framework.id} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{framework.name}</span>
                    {purchasedFrameworks.includes(framework.id) && (
                      <Badge variant="outline" className="ml-auto text-xs">Owned</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                size="lg" 
                className="w-full" 
                onClick={handleBundlePurchase}
                disabled={allFrameworksPurchased}
                data-testid="button-purchase-bundle"
              >
                {allFrameworksPurchased ? 'All Frameworks Owned' : 'Purchase Bundle - Save $1,497'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Individual Framework Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {frameworks.map(framework => {
            const isPurchased = purchasedFrameworks.includes(framework.id);
            
            return (
              <Card 
                key={framework.id} 
                className={isPurchased ? 'border-green-500' : ''}
                data-testid={`card-framework-${framework.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    {isPurchased && (
                      <Badge 
                        variant="default" 
                        className="bg-green-600 hover:bg-green-700"
                        data-testid={`badge-purchased-${framework.id}`}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Purchased
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{framework.name}</CardTitle>
                  <CardDescription className="min-h-[40px]">
                    {framework.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isPurchased && (
                    <div>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-3xl font-bold">$1,499</span>
                        <span className="text-muted-foreground mb-1">AUD one-time</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Full framework access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>All controls & templates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Compliance reporting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Unlimited users</span>
                    </div>
                  </div>

                  {/* Framework-specific features */}
                  {framework.id === 'apgf-ms' && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Includes: RASCI Matrix, Payroll Audit, 62 Obligations, Position Descriptions
                      </p>
                    </div>
                  )}
                  {framework.id === 'iso-9001' && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Includes: QMS Setup, NC/CAPA Workflow, Internal Audit, Document Control
                      </p>
                    </div>
                  )}
                  {framework.id === 'iso-27001' && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Includes: ISMS Setup, Annex A Controls, Risk Assessment, Statement of Applicability
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {isPurchased ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                      data-testid={`button-owned-${framework.id}`}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Already Owned
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handlePurchase(framework.id)}
                      data-testid={`button-purchase-${framework.id}`}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Purchase for $1,499 AUD
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <Card>
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
            <CardDescription>
              Every framework purchase includes comprehensive compliance tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Complete Framework</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    All controls, policies, and templates
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Compliance Tracking</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Real-time status and progress monitoring
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">AI-Powered Tools</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Smart evidence matching and insights
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <Check className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Lifetime Updates</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Free updates to framework standards
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}