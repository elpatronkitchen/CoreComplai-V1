/**
 * Microsoft 365 Provider - Mock Implementation
 * Simulates M365 Graph API for people directory sync
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface M365User {
  id: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
  manager?: {
    id: string;
    displayName: string;
  };
}

interface SeedUser {
  id: string;
  displayName: string;
  email: string;
  title: string;
  department: string;
  location: string;
  states: string[];
  legalEntities: string[];
  roles: string[];
  active: boolean;
}

export class M365Provider {
  private stackProvider: string;
  private cachedUsers: M365User[] | null = null;

  constructor() {
    this.stackProvider = process.env.STACK_PROVIDER || 'local';
  }

  async listUsers(): Promise<M365User[]> {
    if (this.stackProvider === 'azure') {
      // In Azure mode, would call actual Graph API
      throw new Error('Azure M365 integration not yet configured');
    }

    // Local mock mode - load from seed data file
    if (this.cachedUsers) {
      return this.cachedUsers;
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const seedPath = path.join(process.cwd(), 'server', 'data', 'm365_users_seed.json');
      const seedData = await fs.readFile(seedPath, 'utf-8');
      const seedUsers: SeedUser[] = JSON.parse(seedData);

      this.cachedUsers = seedUsers.map(user => ({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        jobTitle: user.title,
        department: user.department,
        officeLocation: user.location,
        mobilePhone: '+61 400 000 000',
        businessPhones: ['+61 2 9000 0000'],
      }));

      return this.cachedUsers;
    } catch (error) {
      console.error('Failed to load M365 seed data:', error);
      // Fallback to minimal data if file not found
      this.cachedUsers = [];
      return this.cachedUsers;
    }
  }

  async getUser(userId: string): Promise<M365User | null> {
    const users = await this.listUsers();
    return users.find(u => u.id === userId) || null;
  }

  async searchUsers(query: string): Promise<M365User[]> {
    const users = await this.listUsers();
    const lowerQuery = query.toLowerCase();
    
    return users.filter(u => 
      u.displayName.toLowerCase().includes(lowerQuery) ||
      u.email.toLowerCase().includes(lowerQuery) ||
      u.jobTitle?.toLowerCase().includes(lowerQuery) ||
      u.department?.toLowerCase().includes(lowerQuery)
    );
  }
}

export const m365Provider = new M365Provider();
