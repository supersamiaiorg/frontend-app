import type { NormalizedResult } from "@shared/schema";

export function getDummyProperty(superId: string): NormalizedResult {
  return {
    key: {
      super_id: superId,
      run_id: "run-dummy-001",
      property_url: "https://www.rightmove.co.uk/properties/123456789",
      received_at: new Date().toISOString(),
    },
    analysis_status: "complete",
    floorplan: {
      inline_csv: `Room,Length,Width,Area,Doors,Windows
Living Room,5.2m,4.8m,24.96 sq m,2,3
Kitchen,4.5m,3.8m,17.10 sq m,1,2
Master Bedroom,4.2m,3.9m,16.38 sq m,1,2
Bedroom 2,3.8m,3.5m,13.30 sq m,1,1
Bedroom 3,3.5m,3.2m,11.20 sq m,1,1
Bathroom,2.8m,2.5m,7.00 sq m,1,1`,
      csv_url: null,
      total_area_csv_url: null,
      json_url: null,
      labelme_side_by_side_url: null,
    },
    image_condition: {
      overall_score: 7.8,
      confidence: 0.85,
      summary: "Property is in good overall condition with modern finishes",
      rooms: [
        { name: "Living Room", score: 8.2, notes: "Well-maintained, good natural light" },
        { name: "Kitchen", score: 7.5, notes: "Modern appliances, some wear visible" },
        { name: "Master Bedroom", score: 8.0, notes: "Clean and spacious" },
        { name: "Bathroom", score: 7.2, notes: "Functional, could use updating" },
      ],
    },
    data_captured: {
      context: "property_analysis",
      status: "complete",
      timestamp: new Date().toISOString(),
      summary: {
        total_endpoints: 5,
        completed_endpoints: 5,
      },
      metadata: {
        property_id: 123456789,
        property_url: "https://www.rightmove.co.uk/properties/123456789",
        client_id: "supersami-demo",
        callback_url: null,
      },
      snapshot: {
        transactionType: "For Sale",
        channel: "BUY",
        bedrooms: 3,
        bathrooms: 2,
        size: {
          primary: "1,200 sq ft",
          secondary: "111.5 sq m",
        },
        price: {
          primary: "£425,000",
          secondary: "Guide Price",
        },
        address: "42 Maple Avenue, Richmond, London",
        postcode: "TW9 2PQ",
        agent: {
          displayName: "Premier Estate Agents",
          telephone: "020 1234 5678",
          logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=100&fit=crop",
          address: "123 High Street, Richmond, London TW9 1AA",
        },
        links: {
          propertyUrl: "https://www.rightmove.co.uk/properties/123456789",
          schoolCheckerUrl: null,
          brochureUrl: null,
          soldPricesUrl: null,
          marketInfoUrl: null,
        },
        media: {
          photos: [
            {
              url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
              thumb: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop",
            },
            {
              url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
              thumb: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=200&fit=crop",
            },
            {
              url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
              thumb: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=200&fit=crop",
            },
            {
              url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
              thumb: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop",
            },
            {
              url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop",
              thumb: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&h=200&fit=crop",
            },
            {
              url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop",
              thumb: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&h=200&fit=crop",
            },
          ],
          floorplans: [
            {
              url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop",
              thumb: null,
              caption: "Ground Floor",
            },
          ],
          epcs: [
            {
              url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop",
              caption: "EPC Rating: C (72)",
            },
          ],
          mapPreviewUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=400&fit=crop",
        },
        location: {
          latitude: 51.4613,
          longitude: -0.3037,
        },
        html: {
          fullDescription: `<p>A stunning three-bedroom semi-detached family home situated in a highly sought-after residential area of Richmond. This beautifully presented property offers spacious and versatile accommodation throughout, making it ideal for modern family living.</p>

<p>The ground floor comprises a welcoming entrance hallway, a generous living room with bay window flooding the space with natural light, a modern fitted kitchen/diner with integrated appliances and access to the rear garden, plus a useful utility room.</p>

<p>Upstairs, you'll find three well-proportioned bedrooms, including a master with fitted wardrobes, plus a contemporary family bathroom with both bath and shower facilities.</p>

<p>Externally, the property benefits from a low-maintenance front garden with off-street parking, and a private south-facing rear garden perfect for alfresco entertaining.</p>

<p>The property is ideally located within walking distance of Richmond town centre, with its excellent array of shops, restaurants, and leisure facilities. Richmond Park and the River Thames are also nearby, offering fantastic outdoor recreational opportunities.</p>`,
          propertyDisclaimer: "All measurements are approximate and should not be relied upon.",
          feesApplyText: null,
        },
        stations: [
          { name: "Richmond", distance: 0.4, unit: "miles" },
          { name: "North Sheen", distance: 0.8, unit: "miles" },
          { name: "Kew Gardens", distance: 1.2, unit: "miles" },
        ],
        schools: [
          { name: "Richmond Park Academy", distance: 0.3, ratingLabel: "Outstanding" },
          { name: "The Vineyard Primary School", distance: 0.5, ratingLabel: "Good" },
          { name: "Christ's School", distance: 0.7, ratingLabel: "Outstanding" },
        ],
        statusLabel: null,
        keyFeatures: [
          "Three double bedrooms",
          "Modern fitted kitchen with integrated appliances",
          "South-facing private garden",
          "Off-street parking",
          "Close to Richmond Park",
          "Walking distance to Richmond Station",
          "EPC Rating C",
          "No onward chain",
        ],
        tags: ["Semi-detached", "Family Home", "Near Transport", "Garden"],
      },
    },
  };
}
