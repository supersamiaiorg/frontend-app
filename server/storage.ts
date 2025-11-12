import type { NormalizedResult } from "@shared/schema";

export interface IStorage {
  storeResult(result: NormalizedResult): Promise<void>;
  getResultBySuperId(super_id: string): Promise<NormalizedResult | undefined>;
  getResultByPropertyUrl(property_url: string): Promise<NormalizedResult | undefined>;
  getAllResults(): Promise<NormalizedResult[]>;
  getAllResultsChrono(): Promise<NormalizedResult[]>;
}

export class MemStorage implements IStorage {
  private bySuperIdMap: Map<string, NormalizedResult>;
  private byPropertyUrlMap: Map<string, NormalizedResult>;
  private chronologicalHistory: NormalizedResult[];
  private readonly MAX_HISTORY_SIZE = 50;

  constructor() {
    this.bySuperIdMap = new Map();
    this.byPropertyUrlMap = new Map();
    this.chronologicalHistory = [];
  }

  async storeResult(result: NormalizedResult): Promise<void> {
    if (result.key.super_id) {
      this.bySuperIdMap.set(result.key.super_id, result);
      
      const existingIndex = this.chronologicalHistory.findIndex(
        r => r.key.super_id === result.key.super_id
      );
      if (existingIndex !== -1) {
        this.chronologicalHistory.splice(existingIndex, 1);
      }
    }
    if (result.key.property_url) {
      this.byPropertyUrlMap.set(result.key.property_url, result);
    }
    
    this.chronologicalHistory.unshift(result);
    
    if (this.chronologicalHistory.length > this.MAX_HISTORY_SIZE) {
      this.chronologicalHistory = this.chronologicalHistory.slice(0, this.MAX_HISTORY_SIZE);
    }
  }

  async getResultBySuperId(super_id: string): Promise<NormalizedResult | undefined> {
    return this.bySuperIdMap.get(super_id);
  }

  async getResultByPropertyUrl(property_url: string): Promise<NormalizedResult | undefined> {
    return this.byPropertyUrlMap.get(property_url);
  }

  async getAllResults(): Promise<NormalizedResult[]> {
    return Array.from(this.bySuperIdMap.values());
  }

  async getAllResultsChrono(): Promise<NormalizedResult[]> {
    return this.chronologicalHistory;
  }
}

export const storage = new MemStorage();

type SSEClient = {
  res: any;
  property_url: string;
};

export const sseClients: SSEClient[] = [];

export function addSSEClient(res: any, property_url: string): void {
  sseClients.push({ res, property_url });
}

export function removeSSEClient(res: any): void {
  const index = sseClients.findIndex(client => client.res === res);
  if (index !== -1) {
    sseClients.splice(index, 1);
  }
}

export function notifySSEClients(property_url: string, super_id: string | null): void {
  sseClients
    .filter(client => client.property_url === property_url)
    .forEach(client => {
      try {
        client.res.write(`data: ${JSON.stringify({ ready: true, super_id })}\n\n`);
        client.res.end();
      } catch (error) {
        console.error("Error notifying SSE client:", error);
      }
    });
}
