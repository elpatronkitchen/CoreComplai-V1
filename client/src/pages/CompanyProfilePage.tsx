import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompanyProfile from '@/components/CompanyProfile';
import KeyPersonnelContent from '@/components/KeyPersonnelContent';
import AppShell from '@/components/AppShell';
import { Building, Users } from 'lucide-react';

export default function CompanyProfilePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">
            Manage company information and key personnel assignments
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2" data-testid="tab-company-profile">
              <Building className="h-4 w-4" />
              Company Details
            </TabsTrigger>
            <TabsTrigger value="personnel" className="flex items-center gap-2" data-testid="tab-key-personnel">
              <Users className="h-4 w-4" />
              Key Personnel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <CompanyProfile />
          </TabsContent>

          <TabsContent value="personnel" className="mt-6">
            <KeyPersonnelContent />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
