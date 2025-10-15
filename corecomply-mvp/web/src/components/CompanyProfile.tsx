import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Users, 
  Save,
  AlertTriangle,
  Loader2,
  Globe
} from 'lucide-react';
import { useApiClient } from '@/lib/api-client';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import type { CompanyProfile as CompanyProfileType, UpdateCompanyProfileRequest } from '@/types/company';
import { useState } from 'react';

export default function CompanyProfile() {
  const apiClient = useApiClient();
  const { hasPermission } = useUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const canView = hasPermission('view_company_settings') || hasPermission('manage_company_profile');
  const canEdit = hasPermission('manage_company_profile');

  // Fetch company profile
  const {
    data: profile,
    isLoading,
    isError,
    refetch
  } = useQuery<CompanyProfileType>({
    queryKey: ['/api/company/profile'],
    queryFn: async () => {
      const response = await apiClient.get('/api/company/profile');
      return response.data;
    },
    enabled: canView,
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCompanyProfileRequest) => {
      await apiClient.put('/api/company/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company/profile'], exact: false });
      toast({
        title: 'Success',
        description: 'Company profile updated successfully',
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update company profile',
        variant: 'destructive',
      });
    },
  });

  const [formData, setFormData] = useState<UpdateCompanyProfileRequest>({
    name: '',
    industry: '',
    abn: '',
    acn: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    employeeCount: 0,
    establishedDate: '',
    logoUrl: '',
  });

  const handleEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        industry: profile.industry,
        abn: profile.abn || '',
        acn: profile.acn || '',
        address: profile.address,
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        employeeCount: profile.employeeCount,
        establishedDate: profile.establishedDate || '',
        logoUrl: profile.logoUrl || '',
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (!canView) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to view the company profile. Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading company profile...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load company profile. Please try again.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="heading-company-profile">Company Profile</h2>
          <p className="text-muted-foreground">
            Manage your organization's information
          </p>
        </div>
        {!isEditing && canEdit && (
          <Button onClick={handleEdit} data-testid="button-edit-profile">
            Edit Profile
          </Button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Edit Company Information</CardTitle>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                      required
                      data-testid="input-company-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    required
                    data-testid="input-industry"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abn">ABN</Label>
                  <Input
                    id="abn"
                    value={formData.abn || ''}
                    onChange={(e) => setFormData({ ...formData, abn: e.target.value })}
                    placeholder="XX XXX XXX XXX"
                    data-testid="input-abn"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acn">ACN</Label>
                  <Input
                    id="acn"
                    value={formData.acn || ''}
                    onChange={(e) => setFormData({ ...formData, acn: e.target.value })}
                    placeholder="XXX XXX XXX"
                    data-testid="input-acn"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="pl-10"
                      required
                      data-testid="input-address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="pl-10"
                      placeholder="https://"
                      data-testid="input-website"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Employee Count *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="employeeCount"
                      type="number"
                      value={formData.employeeCount}
                      onChange={(e) => setFormData({ ...formData, employeeCount: parseInt(e.target.value) || 0 })}
                      className="pl-10"
                      required
                      data-testid="input-employee-count"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="establishedDate">Established Date</Label>
                  <Input
                    id="establishedDate"
                    type="date"
                    value={formData.establishedDate || ''}
                    onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                    data-testid="input-established-date"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    data-testid="input-logo-url"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-save"
                >
                  {updateMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Your organization's details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Company Name</Label>
                <p className="text-lg font-medium" data-testid="text-company-name">{profile?.name || 'Not set'}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Industry</Label>
                <p className="text-lg" data-testid="text-industry">{profile?.industry || 'Not set'}</p>
              </div>

              {profile?.abn && (
                <div>
                  <Label className="text-muted-foreground">ABN</Label>
                  <p className="text-lg" data-testid="text-abn">{profile.abn}</p>
                </div>
              )}

              {profile?.acn && (
                <div>
                  <Label className="text-muted-foreground">ACN</Label>
                  <p className="text-lg" data-testid="text-acn">{profile.acn}</p>
                </div>
              )}

              <div className="md:col-span-2">
                <Label className="text-muted-foreground">Address</Label>
                <p className="text-lg" data-testid="text-address">{profile?.address || 'Not set'}</p>
              </div>

              {profile?.phone && (
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="text-lg" data-testid="text-phone">{profile.phone}</p>
                </div>
              )}

              {profile?.email && (
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-lg" data-testid="text-email">{profile.email}</p>
                </div>
              )}

              {profile?.website && (
                <div>
                  <Label className="text-muted-foreground">Website</Label>
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg text-primary hover:underline"
                    data-testid="link-website"
                  >
                    {profile.website}
                  </a>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Employee Count</Label>
                <p className="text-lg" data-testid="text-employee-count">{profile?.employeeCount || 0}</p>
              </div>

              {profile?.establishedDate && (
                <div>
                  <Label className="text-muted-foreground">Established</Label>
                  <p className="text-lg" data-testid="text-established-date">
                    {new Date(profile.establishedDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {profile?.logoUrl && (
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">Logo</Label>
                  <img 
                    src={profile.logoUrl} 
                    alt="Company Logo" 
                    className="mt-2 h-20 object-contain"
                    data-testid="img-logo"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
