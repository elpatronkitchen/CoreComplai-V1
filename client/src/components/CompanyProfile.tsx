import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  FileText, 
  Shield,
  Plus,
  X,
  Save,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';
import type { CompanyProfile, InsertCompanyProfile } from '@shared/schema';
import { insertCompanyProfileSchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useRasciStore } from '@/lib/setup/rasciStore';
import type { RoleDirectory } from '@/lib/setup/steps';
import { SetupNudge } from './SetupNudge';

type CompanyProfileForm = InsertCompanyProfile;

// Mock employee data from 365 integration (matches People page data)
const mockEmployees = [
  { id: 'EMP-001', name: 'Mia Nguyen', position: 'HR Manager', status: 'Active' },
  { id: 'EMP-002', name: 'Leo Carter', position: 'Payroll Officer', status: 'Active' },
  { id: 'EMP-003', name: 'Harper Lane', position: 'System Administrator', status: 'Terminated' },
  { id: 'EMP-004', name: 'Ella Thompson', position: 'Finance Manager', status: 'Active' },
  { id: 'EMP-005', name: 'Ava Morgan', position: 'Compliance Owner', status: 'Active' },
  { id: 'EMP-006', name: 'Oliver Brown', position: 'IT Security Specialist', status: 'Active' },
  { id: 'EMP-007', name: 'Sophia Davis', position: 'Privacy Officer', status: 'Active' },
  { id: 'EMP-008', name: 'Lucas Martinez', position: 'Data Protection Officer', status: 'Active' },
  { id: 'EMP-009', name: 'Emma Wilson', position: 'CFO', status: 'Active' },
  { id: 'EMP-010', name: 'Noah Anderson', position: 'CEO', status: 'Active' },
];

const AUSTRALIAN_STATES = [
  'NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'
];

const BUSINESS_STRUCTURES = [
  { value: 'sole_trader', label: 'Sole Trader' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'company', label: 'Company' },
  { value: 'trust', label: 'Trust' },
  { value: 'other', label: 'Other' }
];

const INDUSTRIES = [
  'Agriculture, Forestry and Fishing',
  'Mining',
  'Manufacturing',
  'Electricity, Gas, Water and Waste Services',
  'Construction',
  'Wholesale Trade',
  'Retail Trade',
  'Accommodation and Food Services',
  'Transport, Postal and Warehousing',
  'Information Media and Telecommunications',
  'Financial and Insurance Services',
  'Rental, Hiring and Real Estate Services',
  'Professional, Scientific and Technical Services',
  'Administrative and Support Services',
  'Public Administration and Safety',
  'Education and Training',
  'Health Care and Social Assistance',
  'Arts and Recreation Services',
  'Other Services'
];

export default function CompanyProfile() {
  const { currentUser, companyProfile, updateCompanyProfile, addNotification } = useAppStore();
  const { toast } = useToast();
  const { adoptFromKeyPersonnel } = useRasciStore();
  const [isEditing, setIsEditing] = useState(!companyProfile);
  const [sameAsPhysical, setSameAsPhysical] = useState(true);
  const [newActivity, setNewActivity] = useState('');
  const [selectedStates, setSelectedStates] = useState<string[]>(companyProfile?.businessDetails.operatingStates || ['NSW']);

  // Check permissions
  const canEdit = hasPermission(currentUser, 'manage_company_profile');

  // Use mock employees from 365 integration - filter to active only
  const employees = mockEmployees.filter(emp => emp.status === 'Active');

  const form = useForm<CompanyProfileForm>({
    resolver: zodResolver(insertCompanyProfileSchema),
    defaultValues: {
      companyName: companyProfile?.companyName || '',
      tradingName: companyProfile?.tradingName || '',
      abn: companyProfile?.abn || '',
      acn: companyProfile?.acn || '',
      industry: companyProfile?.industry || '',
      businessStructure: companyProfile?.businessStructure || 'company',
      address: {
        street: companyProfile?.address.street || '',
        suburb: companyProfile?.address.suburb || '',
        state: companyProfile?.address.state || 'NSW',
        postcode: companyProfile?.address.postcode || '',
        country: companyProfile?.address.country || 'Australia'
      },
      mailingAddress: companyProfile?.mailingAddress ? {
        street: companyProfile.mailingAddress.street,
        suburb: companyProfile.mailingAddress.suburb,
        state: companyProfile.mailingAddress.state,
        postcode: companyProfile.mailingAddress.postcode,
        country: companyProfile.mailingAddress.country,
        sameAsPhysical: companyProfile.mailingAddress.sameAsPhysical ?? true
      } : {
        street: '',
        suburb: '',
        state: 'NSW',
        postcode: '',
        country: 'Australia',
        sameAsPhysical: true
      },
      contactDetails: {
        phone: companyProfile?.contactDetails.phone || '',
        email: companyProfile?.contactDetails.email || '',
        website: companyProfile?.contactDetails.website || ''
      },
      keyPersonnel: {
        // Executive Level
        ceo: companyProfile?.keyPersonnel.ceo || '',
        executive: companyProfile?.keyPersonnel.executive || '',
        operationsDirector: companyProfile?.keyPersonnel.operationsDirector || '',
        cro: companyProfile?.keyPersonnel.cro || '',
        
        // Finance
        cfo: companyProfile?.keyPersonnel.cfo || '',
        financeManager: companyProfile?.keyPersonnel.financeManager || '',
        financeOfficer: companyProfile?.keyPersonnel.financeOfficer || '',
        controller: companyProfile?.keyPersonnel.controller || '',
        externalAccountant: companyProfile?.keyPersonnel.externalAccountant || '',
        
        // HR & Payroll
        hrManager: companyProfile?.keyPersonnel.hrManager || '',
        hrOfficer: companyProfile?.keyPersonnel.hrOfficer || '',
        hrCoordinator: companyProfile?.keyPersonnel.hrCoordinator || '',
        payrollManager: companyProfile?.keyPersonnel.payrollManager || '',
        payrollOfficer: companyProfile?.keyPersonnel.payrollOfficer || '',
        recruitmentSpecialist: companyProfile?.keyPersonnel.recruitmentSpecialist || '',
        lineManager: companyProfile?.keyPersonnel.lineManager || '',
        
        // Compliance & Audit
        complianceOwner: companyProfile?.keyPersonnel.complianceOwner || '',
        complianceOfficer: companyProfile?.keyPersonnel.complianceOfficer || '',
        complianceAnalyst: companyProfile?.keyPersonnel.complianceAnalyst || '',
        complianceManager: companyProfile?.keyPersonnel.complianceManager || '',
        internalAuditor: companyProfile?.keyPersonnel.internalAuditor || '',
        seniorAuditor: companyProfile?.keyPersonnel.seniorAuditor || '',
        juniorAuditor: companyProfile?.keyPersonnel.juniorAuditor || '',
        externalAuditor: companyProfile?.keyPersonnel.externalAuditor || '',
        observer: companyProfile?.keyPersonnel.observer || '',
        reviewer: companyProfile?.keyPersonnel.reviewer || '',
        
        // IT & Security
        systemAdministrator: companyProfile?.keyPersonnel.systemAdministrator || '',
        itInfoSec: companyProfile?.keyPersonnel.itInfoSec || '',
        itSecurityManager: companyProfile?.keyPersonnel.itSecurityManager || '',
        ciso: companyProfile?.keyPersonnel.ciso || '',
        
        // Legal & Privacy
        legalIr: companyProfile?.keyPersonnel.legalIr || '',
        privacyOfficer: companyProfile?.keyPersonnel.privacyOfficer || '',
        dataProtectionOfficer: companyProfile?.keyPersonnel.dataProtectionOfficer || '',
        
        // Risk & Business Continuity
        riskManager: companyProfile?.keyPersonnel.riskManager || '',
        businessContinuityLead: companyProfile?.keyPersonnel.businessContinuityLead || '',
        
        // External/Other
        externalSme: companyProfile?.keyPersonnel.externalSme || ''
      },
      businessDetails: {
        employeeCount: companyProfile?.businessDetails.employeeCount || 0,
        annualTurnover: companyProfile?.businessDetails.annualTurnover || '',
        operatingStates: companyProfile?.businessDetails.operatingStates || ['NSW'],
        hasOverseasOperations: companyProfile?.businessDetails.hasOverseasOperations || false,
        primaryActivities: companyProfile?.businessDetails.primaryActivities || []
      },
      regulatoryInfo: companyProfile?.regulatoryInfo || {
        licences: [],
        registrations: [],
        complianceFrameworks: []
      }
    }
  });

  useEffect(() => {
    setSameAsPhysical(form.watch('mailingAddress.sameAsPhysical') ?? true);
  }, [form.watch('mailingAddress.sameAsPhysical')]);

  // Reset form when companyProfile changes (e.g., after save or tab navigation)
  useEffect(() => {
    if (companyProfile) {
      form.reset({
        companyName: companyProfile.companyName,
        tradingName: companyProfile.tradingName,
        abn: companyProfile.abn,
        acn: companyProfile.acn,
        industry: companyProfile.industry,
        businessStructure: companyProfile.businessStructure,
        address: companyProfile.address,
        mailingAddress: companyProfile.mailingAddress,
        contactDetails: companyProfile.contactDetails,
        keyPersonnel: companyProfile.keyPersonnel,
        businessDetails: companyProfile.businessDetails,
        regulatoryInfo: companyProfile.regulatoryInfo
      });
      setSelectedStates(companyProfile.businessDetails.operatingStates);
    }
  }, [companyProfile]);

  const onSubmit = (data: CompanyProfileForm) => {
    try {
      const profileData: CompanyProfile = {
        id: companyProfile?.id || crypto.randomUUID(),
        ...data,
        businessDetails: {
          ...data.businessDetails,
          operatingStates: selectedStates
        },
        createdAt: companyProfile?.createdAt || new Date(),
        updatedAt: new Date(),
        createdBy: companyProfile?.createdBy || currentUser?.id || 'system',
        lastUpdatedBy: currentUser?.id || 'system'
      };

      updateCompanyProfile(profileData);
      
      // Map Company Profile key personnel to RoleDirectory and adopt to RASCI
      // This makes Company Profile the "source of truth" for Key Personnel assignments
      const roleDirectory: RoleDirectory = {
        CEO: mockEmployees.find(e => e.name === data.keyPersonnel.ceo)?.id,
        BoardChair: mockEmployees.find(e => e.name === data.keyPersonnel.executive)?.id,
        AuditRiskChair: mockEmployees.find(e => e.name === data.keyPersonnel.executive)?.id,
        ComplianceOwner: mockEmployees.find(e => e.name === data.keyPersonnel.complianceOwner)?.id,
        PayrollOfficer: mockEmployees.find(e => e.name === data.keyPersonnel.payrollOfficer)?.id,
        PayrollManager: mockEmployees.find(e => e.name === data.keyPersonnel.payrollManager)?.id,
        HROfficer: mockEmployees.find(e => e.name === data.keyPersonnel.hrOfficer)?.id,
        HRManager: mockEmployees.find(e => e.name === data.keyPersonnel.hrManager)?.id,
        FinanceManager: mockEmployees.find(e => e.name === data.keyPersonnel.financeManager)?.id,
        CFO: mockEmployees.find(e => e.name === data.keyPersonnel.cfo)?.id,
        ITSecurity: mockEmployees.find(e => e.name === data.keyPersonnel.systemAdministrator)?.id,
        InternalAudit: mockEmployees.find(e => e.name === data.keyPersonnel.internalAuditor)?.id,
        ExternalAccountant: mockEmployees.find(e => e.name === data.keyPersonnel.externalAccountant)?.id
      };
      
      // Automatically adopt Key Personnel to RASCI matrix
      adoptFromKeyPersonnel(roleDirectory);
      
      // Show toast notification for immediate feedback
      toast({
        title: "Company Profile Saved",
        description: "Your company profile and RASCI assignments have been successfully updated.",
      });
      
      // Add to notification center
      addNotification({
        title: 'Company Profile Updated',
        message: 'Company profile has been successfully updated. RASCI matrix has been auto-adopted from Key Personnel.',
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });
      
      setIsEditing(false);
    } catch (error) {
      addNotification({
        title: 'Update Failed',
        message: 'Failed to update company profile. Please try again.',
        type: 'error',
        timestamp: new Date().toISOString(),
        read: false
      });
    }
  };

  const addPrimaryActivity = () => {
    if (newActivity.trim()) {
      const currentActivities = form.getValues('businessDetails.primaryActivities');
      form.setValue('businessDetails.primaryActivities', [...currentActivities, newActivity.trim()]);
      setNewActivity('');
    }
  };

  const removePrimaryActivity = (index: number) => {
    const currentActivities = form.getValues('businessDetails.primaryActivities');
    form.setValue('businessDetails.primaryActivities', currentActivities.filter((_, i) => i !== index));
  };

  const toggleState = (state: string) => {
    setSelectedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
          <h3 className="text-lg font-medium">Access Restricted</h3>
          <p className="text-muted-foreground">Only compliance owners and administrators can manage company profile</p>
        </div>
      </div>
    );
  }

  if (!companyProfile && !isEditing) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Company Profile Not Set Up</h3>
        <p className="text-muted-foreground mb-4">
          Set up your company profile to populate policy templates and compliance requirements
        </p>
        <Button onClick={() => setIsEditing(true)} data-testid="button-setup-company">
          <Plus className="mr-2 h-4 w-4" />
          Set Up Company Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SetupNudge 
        stepKey="companyProfile" 
        message="Complete your company profile to generate the statutory timetable and seed compliance obligations."
      />
      
      {/* Key Personnel Functionality Explanation */}
      <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
        <Info className="h-4 w-4 text-amber-700 dark:text-amber-400" />
        <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
          <strong>Key Personnel Mapping:</strong> The Key Personnel assignments below automatically map to all controls, policies, obligations, RASCI matrices, and audit workflows across the entire system. When someone leaves and you assign their replacement here, their successor is automatically assigned all their compliance responsibilities for seamless continuity.
        </AlertDescription>
      </Alert>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">
            Manage company information for policy templates and compliance requirements
          </p>
        </div>
        {!isEditing && companyProfile && (
          <Button onClick={() => setIsEditing(true)} data-testid="button-edit-company">
            <FileText className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Company Profile Form */}
      {isEditing ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="address">Address & Contact</TabsTrigger>
              <TabsTrigger value="business">Business Details</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company Information
                  </CardTitle>
                  <CardDescription>
                    Basic company details and business structure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        {...form.register('companyName')}
                        placeholder="Enter company name"
                        data-testid="input-company-name"
                      />
                      {form.formState.errors.companyName && (
                        <p className="text-red-500 text-sm">{form.formState.errors.companyName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tradingName">Trading Name</Label>
                      <Input
                        id="tradingName"
                        {...form.register('tradingName')}
                        placeholder="Enter trading name (if different)"
                        data-testid="input-trading-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="abn">ABN</Label>
                      <Input
                        id="abn"
                        {...form.register('abn')}
                        placeholder="Australian Business Number"
                        data-testid="input-abn"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="acn">ACN</Label>
                      <Input
                        id="acn"
                        {...form.register('acn')}
                        placeholder="Australian Company Number"
                        data-testid="input-acn"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Controller
                        name="industry"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-industry">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {INDUSTRIES.map(industry => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.industry && (
                        <p className="text-red-500 text-sm">{form.formState.errors.industry.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessStructure">Business Structure *</Label>
                      <Controller
                        name="businessStructure"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-business-structure">
                              <SelectValue placeholder="Select business structure" />
                            </SelectTrigger>
                            <SelectContent>
                              {BUSINESS_STRUCTURES.map(structure => (
                                <SelectItem key={structure.value} value={structure.value}>
                                  {structure.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Address & Contact Tab */}
            <TabsContent value="address" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address & Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Physical Address */}
                  <div>
                    <h4 className="font-medium mb-3">Physical Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="address.street">Street Address *</Label>
                        <Input
                          id="address.street"
                          {...form.register('address.street')}
                          placeholder="Enter street address"
                          data-testid="input-street"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.suburb">Suburb *</Label>
                        <Input
                          id="address.suburb"
                          {...form.register('address.suburb')}
                          placeholder="Enter suburb"
                          data-testid="input-suburb"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.state">State *</Label>
                        <Controller
                          name="address.state"
                          control={form.control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger data-testid="select-state">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {AUSTRALIAN_STATES.map(state => (
                                  <SelectItem key={state} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.postcode">Postcode *</Label>
                        <Input
                          id="address.postcode"
                          {...form.register('address.postcode')}
                          placeholder="Enter postcode"
                          data-testid="input-postcode"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.country">Country *</Label>
                        <Input
                          id="address.country"
                          {...form.register('address.country')}
                          placeholder="Enter country"
                          data-testid="input-country"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div>
                    <h4 className="font-medium mb-3">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactDetails.phone">Phone Number *</Label>
                        <Input
                          id="contactDetails.phone"
                          {...form.register('contactDetails.phone')}
                          placeholder="Enter phone number"
                          data-testid="input-phone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactDetails.email">Email Address *</Label>
                        <Input
                          id="contactDetails.email"
                          type="email"
                          {...form.register('contactDetails.email')}
                          placeholder="Enter email address"
                          data-testid="input-email"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="contactDetails.website">Website</Label>
                        <Input
                          id="contactDetails.website"
                          {...form.register('contactDetails.website')}
                          placeholder="Enter website URL"
                          data-testid="input-website"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Business Details Tab */}
            <TabsContent value="business" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessDetails.employeeCount">Number of Employees</Label>
                      <Input
                        id="businessDetails.employeeCount"
                        type="number"
                        {...form.register('businessDetails.employeeCount', { valueAsNumber: true })}
                        placeholder="Enter employee count"
                        data-testid="input-employee-count"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessDetails.annualTurnover">Annual Turnover</Label>
                      <Input
                        id="businessDetails.annualTurnover"
                        {...form.register('businessDetails.annualTurnover')}
                        placeholder="e.g., $1M - $5M"
                        data-testid="input-annual-turnover"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Operating States</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {AUSTRALIAN_STATES.map(state => (
                        <div key={state} className="flex items-center space-x-2">
                          <Checkbox
                            id={`state-${state}`}
                            checked={selectedStates.includes(state)}
                            onCheckedChange={() => toggleState(state)}
                            data-testid={`checkbox-state-${state}`}
                          />
                          <Label htmlFor={`state-${state}`} className="text-sm">
                            {state}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="businessDetails.hasOverseasOperations"
                        control={form.control}
                        render={({ field }) => (
                          <Checkbox
                            id="hasOverseasOperations"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-overseas-operations"
                          />
                        )}
                      />
                      <Label htmlFor="hasOverseasOperations">
                        Has overseas operations
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Business Activities</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        placeholder="Add business activity"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrimaryActivity())}
                        data-testid="input-new-activity"
                      />
                      <Button type="button" onClick={addPrimaryActivity} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.watch('businessDetails.primaryActivities').map((activity, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {activity}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removePrimaryActivity(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5" />
                    Key Personnel Quick Assign
                  </CardTitle>
                  <CardDescription>
                    Assign primary roles. For advanced management, use the Key Personnel tab above.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyPersonnel.ceo">CEO</Label>
                      <Controller
                        name="keyPersonnel.ceo"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-ceo">
                              <SelectValue placeholder="Select CEO" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.name}>
                                  {emp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="keyPersonnel.cfo">CFO</Label>
                      <Controller
                        name="keyPersonnel.cfo"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-cfo">
                              <SelectValue placeholder="Select CFO" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.name}>
                                  {emp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="keyPersonnel.complianceOwner">Compliance Owner</Label>
                      <Controller
                        name="keyPersonnel.complianceOwner"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-compliance-owner">
                              <SelectValue placeholder="Select Compliance Owner" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.name}>
                                  {emp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="keyPersonnel.payrollManager">Payroll Manager</Label>
                      <Controller
                        name="keyPersonnel.payrollManager"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-payroll-manager">
                              <SelectValue placeholder="Select Payroll Manager" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.name}>
                                  {emp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="keyPersonnel.hrManager">HR Manager</Label>
                      <Controller
                        name="keyPersonnel.hrManager"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-hr-manager">
                              <SelectValue placeholder="Select HR Manager" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.name}>
                                  {emp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="keyPersonnel.financeManager">Finance Manager</Label>
                      <Controller
                        name="keyPersonnel.financeManager"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-finance-manager">
                              <SelectValue placeholder="Select Finance Manager" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.name}>
                                  {emp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="button-save-company">
              <Save className="mr-2 h-4 w-4" />
              Save Company Profile
            </Button>
          </div>
        </form>
      ) : (
        /* Display Mode */
        <div className="space-y-6">
          {companyProfile && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {companyProfile.companyName}
                  </CardTitle>
                  {companyProfile.tradingName && (
                    <CardDescription>Trading as: {companyProfile.tradingName}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Industry</Label>
                      <p className="text-sm text-muted-foreground">{companyProfile.industry}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Business Structure</Label>
                      <p className="text-sm text-muted-foreground">
                        {BUSINESS_STRUCTURES.find(s => s.value === companyProfile.businessStructure)?.label}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Employees</Label>
                      <p className="text-sm text-muted-foreground">{companyProfile.businessDetails.employeeCount}</p>
                    </div>
                  </div>
                  
                  {(companyProfile.abn || companyProfile.acn) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {companyProfile.abn && (
                        <div>
                          <Label className="text-sm font-medium">ABN</Label>
                          <p className="text-sm text-muted-foreground">{companyProfile.abn}</p>
                        </div>
                      )}
                      {companyProfile.acn && (
                        <div>
                          <Label className="text-sm font-medium">ACN</Label>
                          <p className="text-sm text-muted-foreground">{companyProfile.acn}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="w-4 h-4" />
                      Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {companyProfile.address.street}<br />
                      {companyProfile.address.suburb} {companyProfile.address.state} {companyProfile.address.postcode}<br />
                      {companyProfile.address.country}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Phone className="w-4 h-4" />
                      Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>Phone:</strong> {companyProfile.contactDetails.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Email:</strong> {companyProfile.contactDetails.email}
                    </p>
                    {companyProfile.contactDetails.website && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Website:</strong> {companyProfile.contactDetails.website}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}