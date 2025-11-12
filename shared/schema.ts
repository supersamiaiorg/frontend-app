import { z } from "zod";

export const normalizedResultSchema = z.object({
  key: z.object({
    super_id: z.string().nullable(),
    property_url: z.string().nullable(),
    received_at: z.string(),
  }),
  analysis_status: z.enum(["analyzing", "complete", "error"]),
  floorplan: z.object({
    inline_csv: z.string().nullable(),
    csv_url: z.string().nullable(),
    total_area_csv_url: z.string().nullable(),
    json_url: z.string().nullable(),
    labelme_side_by_side_url: z.string().nullable(),
  }),
  image_condition: z.any().nullable(),
  data_captured: z.object({
    context: z.string().nullable(),
    status: z.string().nullable(),
    timestamp: z.string().nullable(),
    summary: z.object({
      total_endpoints: z.number().nullable(),
      completed_endpoints: z.number().nullable(),
    }).nullable(),
    metadata: z.object({
      property_id: z.union([z.number(), z.string()]).nullable(),
      property_url: z.string().nullable(),
      client_id: z.string().nullable(),
      callback_url: z.string().nullable(),
    }).nullable(),
    snapshot: z.object({
      transactionType: z.string().nullable(),
      channel: z.string().nullable(),
      bedrooms: z.number().nullable(),
      bathrooms: z.number().nullable(),
      size: z.object({
        primary: z.string().nullable(),
        secondary: z.string().nullable(),
      }).nullable(),
      price: z.object({
        primary: z.string().nullable(),
        secondary: z.string().nullable(),
      }).nullable(),
      address: z.string().nullable(),
      postcode: z.string().nullable(),
      agent: z.object({
        displayName: z.string().nullable(),
        telephone: z.string().nullable(),
        logo: z.string().nullable(),
        address: z.string().nullable(),
      }).nullable(),
      links: z.object({
        propertyUrl: z.string().nullable(),
        schoolCheckerUrl: z.string().nullable(),
        brochureUrl: z.string().nullable(),
        soldPricesUrl: z.string().nullable(),
        marketInfoUrl: z.string().nullable(),
      }).nullable(),
      media: z.object({
        photos: z.array(z.object({
          url: z.string(),
          thumb: z.string().nullable(),
        })),
        floorplans: z.array(z.object({
          url: z.string(),
          thumb: z.string().nullable(),
          caption: z.string().nullable(),
        })),
        epcs: z.array(z.object({
          url: z.string(),
          caption: z.string().nullable(),
        })),
        mapPreviewUrl: z.string().nullable(),
      }).nullable(),
      location: z.object({
        latitude: z.number().nullable(),
        longitude: z.number().nullable(),
      }).nullable(),
      html: z.object({
        fullDescription: z.string().nullable(),
        propertyDisclaimer: z.string().nullable(),
        feesApplyText: z.string().nullable(),
      }).nullable(),
      stations: z.array(z.object({
        name: z.string(),
        distance: z.number(),
        unit: z.string().nullable(),
      })),
      schools: z.array(z.object({
        name: z.string(),
        distance: z.number().nullable(),
        ratingLabel: z.string().nullable(),
      })),
      statusLabel: z.string().nullable(),
      keyFeatures: z.array(z.string()).nullable(),
      tags: z.array(z.string()).nullable(),
    }).nullable(),
  }).nullable(),
});

export type NormalizedResult = z.infer<typeof normalizedResultSchema>;

export const triggerRequestSchema = z.object({
  property_url: z.string().url("Invalid property URL"),
});

export type TriggerRequest = z.infer<typeof triggerRequestSchema>;
