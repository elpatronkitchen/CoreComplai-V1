export interface Policy {
  id: string;
  title: string;
  description?: string;
  version: string;
  owner: string;
  status: 'Published' | 'Draft' | 'Archived';
  effectiveFrom: string;
  effectiveTo?: string;
  tags: string[];
}
