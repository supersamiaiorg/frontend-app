import type { NormalizedResult } from "@shared/schema";

export interface IStorage {
  storeResult(result: NormalizedResult): Promise<void>;
  getResultBySuperId(super_id: string): Promise<NormalizedResult | undefined>;
  getResultByPropertyUrl(
    property_url: string,
  ): Promise<NormalizedResult | undefined>;
  getAllResults(): Promise<NormalizedResult[]>;
  getAllResultsChrono(): Promise<NormalizedResult[]>;
}

export class MemStorage implements IStorage {
  private bySuperIdMap = new Map<string, NormalizedResult>();
  private byPropertyUrlMap = new Map<string, NormalizedResult>();
  private chronologicalHistory: NormalizedResult[] = [];
  private readonly MAX_HISTORY_SIZE = 50;

  async storeResult(result: NormalizedResult): Promise<void> {
    const superId = result.key.super_id;
    const propertyUrl = result.key.property_url;

    if (superId) this.bySuperIdMap.set(superId, result);
    if (propertyUrl) this.byPropertyUrlMap.set(propertyUrl, result);

    const idx = this.chronologicalHistory.findIndex(
      (r) =>
        (superId && r.key.super_id === superId) ||
        (!superId && propertyUrl && r.key.property_url === propertyUrl),
    );

    if (idx !== -1) {
      const existing = this.chronologicalHistory[idx];
      const merged: NormalizedResult = {
        ...existing,
        ...result,
        key: { ...existing.key, ...result.key },
        floorplan: result.floorplan ?? existing.floorplan,
        image_condition: result.image_condition ?? existing.image_condition,
        data_captured: result.data_captured ?? existing.data_captured,
        analysis_status: result.analysis_status,
      };
      this.chronologicalHistory[idx] = merged;
    } else {
      this.chronologicalHistory.unshift(result);
      if (this.chronologicalHistory.length > this.MAX_HISTORY_SIZE) {
        this.chronologicalHistory.pop();
      }
    }
  }

  async getResultBySuperId(super_id: string) {
    return this.bySuperIdMap.get(super_id);
  }

  async getResultByPropertyUrl(property_url: string) {
    return this.byPropertyUrlMap.get(property_url);
  }

  async getAllResults() {
    return Array.from(this.chronologicalHistory);
  }

  async getAllResultsChrono() {
    return Array.from(this.chronologicalHistory);
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
  const index = sseClients.findIndex((client) => client.res === res);
  if (index !== -1) sseClients.splice(index, 1);
}

export function notifySSEClients(
  property_url: string,
  super_id: string | null,
): void {
  sseClients
    .filter((client) => client.property_url === property_url)
    .forEach((client) => {
      try {
        client.res.write(
          `data: ${JSON.stringify({ ready: true, super_id })}\n\n`,
        );
        client.res.end();
      } catch (error) {
        console.error("Error notifying SSE client:", error);
      }
    });
}
