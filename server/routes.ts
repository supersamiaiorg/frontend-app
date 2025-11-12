import type { Express, Response } from "express";
import { createServer, type Server } from "http";
import { storage, addSSEClient, removeSSEClient, notifySSEClients, sseClients } from "./storage";
import { normalize } from "./normalize";
import { triggerRequestSchema } from "@shared/schema";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

const N8N_WEBHOOK_URL = "https://supersami.app.n8n.cloud/webhook/d36312c5-f379-4b22-9f6c-e4d44f50af4c";
const TEST_MODE = process.env.TEST_MODE === "true";
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/trigger", async (req, res) => {
    try {
      const { property_url } = triggerRequestSchema.parse(req.body);
      const workflow_callback_url = `${PUBLIC_BASE_URL}/api/analysis/callback`;

      console.log(`[/api/trigger] Received property_url: ${property_url}`);
      console.log(`[/api/trigger] Callback URL: ${workflow_callback_url}`);

      const payload = {
        property_url,
        workflow_callback_url
      };

      console.log(`[/api/trigger] Sending payload to n8n:`, JSON.stringify(payload));

      if (TEST_MODE) {
        console.log("[/api/trigger] TEST_MODE enabled - not calling n8n webhook");
        return res.json({ 
          success: true, 
          message: "TEST_MODE: Use POST /api/test/simulate-callback to trigger callback",
          workflow_callback_url
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
      console.log("[/api/analysis/callback] Raw body keys:", Object.keys(req.body));
      
      const payload = req.body.body ?? req.body;
      
      console.log("[/api/analysis/callback] Payload keys:", Object.keys(payload));
      console.log("[/api/analysis/callback] Payload preview:", JSON.stringify(payload).substring(0, 500) + "...");
      
      if (payload.final_result === "[object Object]") {
        console.error("[/api/analysis/callback] PAYLOAD ERROR: final_result is stringified as '[object Object]'");
        return res.status(400).json({ 
          error: "Invalid n8n payload format",
          details: "The 'final_result' field is being sent as the string '[object Object]' instead of an actual JSON object. In your n8n HTTP Request node: 1) Set Content-Type to 'application/json', 2) Enable 'Send Body as JSON', 3) Use an expression like {{ $json }} to map the entire webhook payload as JSON, not as key/value pairs."
        });
      }

      const normalized = normalize(payload);

      const hasFloorplan = normalized.floorplan.inline_csv || normalized.floorplan.csv_url;
      if (!hasFloorplan) {
        console.warn("[/api/analysis/callback] Missing floorplan CSV data");
        console.warn("[/api/analysis/callback] Floorplan object:", JSON.stringify(normalized.floorplan));
        return res.status(400).json({ 
          error: "floorplan CSV missing",
          details: "Neither inline_csv nor csv_url found in floorplan data. Check that the n8n workflow is sending the complete final_result object with floorplan_data."
        });
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

  app.get("/api/history", async (req, res) => {
    try {
      const results = await storage.getAllResultsChrono();
      
      const history = results.map(result => {
        const snapshot = result.data_captured?.snapshot;
        const firstPhoto = snapshot?.media?.photos?.[0];
        
        return {
          super_id: result.key.super_id,
          property_url: result.key.property_url,
          received_at: result.key.received_at,
          address: snapshot?.address || snapshot?.postcode || result.key.property_url || 'Unknown Property',
          price: snapshot?.price?.primary || null,
          thumbnail: firstPhoto?.thumb || firstPhoto?.url || null,
          bedrooms: snapshot?.bedrooms || null,
          bathrooms: snapshot?.bathrooms || null,
        };
      });

      res.json(history);
    } catch (error) {
      console.error("[/api/history] Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  if (process.env.NODE_ENV === "development") {
    app.post("/api/test/simulate-callback", async (req, res) => {
      try {
        console.log("[/api/test/simulate-callback] Simulating callback");
        
        let payload = req.body;
        
        if (!payload || Object.keys(payload).length === 0) {
          const fixturePath = path.join(process.cwd(), "server/fixtures/sample_callback.json");
          
          if (!fs.existsSync(fixturePath)) {
            return res.status(400).json({ 
              error: "No payload provided and fixture file not found", 
              help: "Send a payload in the request body OR create server/fixtures/sample_callback.json"
            });
          }

          payload = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
        }

        const normalized = normalize(payload);
        await storage.storeResult(normalized);
        
        console.log(`[/api/test/simulate-callback] Stored result for super_id: ${normalized.key.super_id}`);
        
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
