import { type User, type InsertUser, type ROIValidation, type InsertROIValidation } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // ROI Validation methods
  trackROIValidation(validation: InsertROIValidation): Promise<ROIValidation>;
  getROISummary(): Promise<{
    totalItemsValidated: number;
    totalHoursAvoided: number;
    totalDollarsSaved: number;
    avgTimePerItem: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private roiValidations: Map<string, ROIValidation>;

  constructor() {
    this.users = new Map();
    this.roiValidations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      role: insertUser.role as any // Type assertion for enum compatibility
    };
    this.users.set(id, user);
    return user;
  }

  async trackROIValidation(insertValidation: InsertROIValidation): Promise<ROIValidation> {
    const id = randomUUID();
    const validation: ROIValidation = {
      ...insertValidation,
      id,
      validatedAt: new Date()
    };
    this.roiValidations.set(id, validation);
    return validation;
  }

  async getROISummary(): Promise<{
    totalItemsValidated: number;
    totalHoursAvoided: number;
    totalDollarsSaved: number;
    avgTimePerItem: number;
  }> {
    const validations = Array.from(this.roiValidations.values());
    
    if (validations.length === 0) {
      return {
        totalItemsValidated: 0,
        totalHoursAvoided: 0,
        totalDollarsSaved: 0,
        avgTimePerItem: 0
      };
    }

    // Helper to safely parse Drizzle numeric (string) to number
    const parseDecimal = (value: string): number => {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        throw new Error(`Invalid decimal value: ${value}`);
      }
      return parsed;
    };

    const totalHoursAvoided = validations.reduce((sum, v) => sum + parseDecimal(v.hoursAvoided), 0);
    const totalDollarsSaved = validations.reduce((sum, v) => sum + parseDecimal(v.dollarsSaved), 0);
    const totalActualMinutes = validations.reduce((sum, v) => sum + v.actualMinutes, 0); // integer field, already number

    return {
      totalItemsValidated: validations.length,
      totalHoursAvoided: Math.round(totalHoursAvoided * 100) / 100,
      totalDollarsSaved: Math.round(totalDollarsSaved * 100) / 100,
      avgTimePerItem: validations.length > 0 
        ? Math.round((totalActualMinutes / validations.length) * 100) / 100 
        : 0
    };
  }
}

export const storage = new MemStorage();
