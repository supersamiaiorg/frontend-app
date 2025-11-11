import type { Express, Response } from "express";
import { createServer, type Server } from "http";
import { storage, addSSEClient, removeSSEClient, notifySSEClients, sseClients } from "./storage";
import { normalize } from "./normalize";
import { triggerRequestSchema } from "@shared/schema";
import { z } from "zod";

const N8N_WEBHOOK_URL = "https://supersami.app.n8n.cloud/webhook/d36312c5-f379-4b22-9f6c-e4d44f50af4c";
const TEST_MODE = process.env.TEST_MODE === "true";
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/trigger", async (req, res) => {
    try {
      const { property_url } = triggerRequestSchema.parse(req.body);
      const callback_url = `${PUBLIC_BASE_URL}/api/analysis/callback`;

      console.log(`[/api/trigger] Received property_url: ${property_url}`);
      console.log(`[/api/trigger] Callback URL: ${callback_url}`);

      const payload = {
        property_url,
        callback_url
      };

      if (TEST_MODE) {
        console.log("[/api/trigger] TEST_MODE enabled - not calling n8n webhook");
        return res.json({ 
          success: true, 
          message: "TEST_MODE: Use POST /api/test/simulate-callback to trigger callback",
          callback_url
        });
      }

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`n8n webhook returned ${response.status}`);
      }

      const data = await response.json();
      console.log(`[/api/trigger] n8n response:`, data);

      res.json({ success: true, message: "Analysis triggered successfully" });
    } catch (error) {
      console.error("[/api/trigger] Error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request", details: error.errors });
      }
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/analysis/callback", async (req, res) => {
    try {
      console.log("[/api/analysis/callback] Received webhook callback");
      console.log("[/api/analysis/callback] Body:", JSON.stringify(req.body, null, 2));

      const normalized = normalize(req.body);

      const hasFloorplan = normalized.floorplan.inline_csv || normalized.floorplan.csv_url;
      if (!hasFloorplan) {
        console.warn("[/api/analysis/callback] Missing floorplan CSV data");
        return res.status(400).json({ error: "floorplan CSV missing" });
      }

      await storage.storeResult(normalized);
      console.log(`[/api/analysis/callback] Stored result for super_id: ${normalized.key.super_id}`);

      if (normalized.key.property_url) {
        notifySSEClients(normalized.key.property_url, normalized.key.super_id);
      }

      res.json({ success: true, super_id: normalized.key.super_id });
    } catch (error) {
      console.error("[/api/analysis/callback] Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/stream", (req, res) => {
    const property_url = req.query.property_url as string;
    
    if (!property_url) {
      return res.status(400).json({ error: "property_url query parameter required" });
    }

    console.log(`[/api/stream] Client connected for property_url: ${property_url}`);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    addSSEClient(res, property_url);

    const heartbeatInterval = setInterval(() => {
      try {
        res.write(": heartbeat\n\n");
      } catch (error) {
        console.error("[/api/stream] Heartbeat error:", error);
        clearInterval(heartbeatInterval);
      }
    }, 25000);

    const timeout = setTimeout(() => {
      try {
        res.write(`data: ${JSON.stringify({ ready: false, timeout: true })}\n\n`);
        res.end();
      } catch (error) {
        console.error("[/api/stream] Timeout error:", error);
      }
      clearInterval(heartbeatInterval);
    }, 15 * 60 * 1000);

    req.on("close", () => {
      console.log(`[/api/stream] Client disconnected for property_url: ${property_url}`);
      clearInterval(heartbeatInterval);
      clearTimeout(timeout);
      removeSSEClient(res);
    });
  });

  app.get("/api/results", async (req, res) => {
    try {
      const super_id = req.query.super_id as string;
      const property_url = req.query.property_url as string;

      console.log(`[/api/results] Query: super_id=${super_id}, property_url=${property_url}`);

      let result;
      if (super_id) {
        result = await storage.getResultBySuperId(super_id);
      } else if (property_url) {
        result = await storage.getResultByPropertyUrl(property_url);
      } else {
        return res.status(400).json({ error: "Either super_id or property_url query parameter required" });
      }

      if (!result) {
        return res.status(404).json({ error: "Result not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("[/api/results] Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  if (TEST_MODE) {
    app.post("/api/test/simulate-callback", async (req, res) => {
      try {
        console.log("[/api/test/simulate-callback] Simulating callback with fixture data");
        
        const fs = await import("fs");
        const path = await import("path");
        const fixturePath = path.join(process.cwd(), "server/fixtures/sample_callback.json");
        
        if (!fs.existsSync(fixturePath)) {
          return res.status(404).json({ 
            error: "Fixture file not found", 
            path: fixturePath,
            help: "Create server/fixtures/sample_callback.json with sample webhook data"
          });
        }

        const fixtureData = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
        
        const property_url = req.body.property_url;
        if (property_url && fixtureData[0]?.final_result?.data_captured?.metadata) {
          fixtureData[0].final_result.data_captured.metadata.property_url = property_url;
        }

        const normalized = normalize(fixtureData);
        await storage.storeResult(normalized);
        
        if (normalized.key.property_url) {
          notifySSEClients(normalized.key.property_url, normalized.key.super_id);
        }

        res.json({ 
          success: true, 
          super_id: normalized.key.super_id,
          property_url: normalized.key.property_url
        });
      } catch (error) {
        console.error("[/api/test/simulate-callback] Error:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
      }
    });
  }

  app.get("/api/proxy-csv", async (req, res) => {
    const url = req.query.url as string;
    
    if (!url) {
      return res.status(400).json({ error: "url query parameter required" });
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`);
      }
      
      const csvText = await response.text();
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(csvText);
    } catch (error) {
      console.error("[/api/proxy-csv] Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
