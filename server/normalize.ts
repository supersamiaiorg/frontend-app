import type { NormalizedResult } from "@shared/schema";

function firstItem(body: any) {
  return Array.isArray(body) ? body[0] : body;
}

export function normalize(body: any): NormalizedResult {
  const root = firstItem(body) ?? {};
  const fr = root.final_result ?? {};
  
  const fp = fr.floorplan_data ?? {};
  const ica = fr.image_condition_data?.ica_overall_analysis ?? null;
  const dc = fr.data_captured ?? null;

  let snap: any = null;
  try {
    const results = dc?.data?.results ?? [];
    const rawDatas = results
      .map((r: any) => r?.raw_data?.data)
      .filter(Boolean);

    const pref = rawDatas.find((d: any) => d?.transactionType || d?.text || d?.price) ?? rawDatas[0];

    if (pref) {
      const photos = (pref.photos || pref.images || []).map((p: any) => ({
        url: p.maxSizeUrl || p.url,
        thumb: p.thumbnailUrl || p.resizedImageUrls?.size135x100 || null
      })).filter((p: any) => p.url);

      const floorplans = (pref.floorplans || []).map((f: any) => ({
        url: f.url,
        thumb: f.thumbnailUrl || f.resizedFloorplanUrls?.size296x197 || null,
        caption: f.caption || null
      })).filter((f: any) => f.url);

      const epcs = (pref.epcs || pref.epcGraphs || []).map((e: any) => ({
        url: e.url,
        caption: e.caption || null
      })).filter((e: any) => e.url);

      const stations = (pref.stations || pref.nearestStations || []).map((s: any) => ({
        name: s.station || s.name,
        distance: s.distance,
        unit: s.unit || null
      })).filter((s: any) => s.name);

      const schools = (pref.nearestSchools || []).map((s: any) => ({
        name: s.name,
        distance: s.distance,
        ratingLabel: s.ratingLabel || null
      }));

      snap = {
        transactionType: pref.transactionType ?? null,
        channel: pref.channel ?? null,
        bedrooms: pref.bedrooms ?? (parseInt(pref.infoReelItems?.find((x: any) => x.type === "BEDROOMS")?.primaryText ?? "") ?? null),
        bathrooms: pref.bathrooms ?? (parseInt(pref.infoReelItems?.find((x: any) => x.type === "BATHROOMS")?.primaryText ?? "") ?? null),
        size: {
          primary: pref.size?.primary ?? (pref.sizings?.find((z: any) => z.unit === "sqft")?.minimumSize ? `${pref.sizings.find((z: any) => z.unit === "sqft").minimumSize} sq ft` : (pref.infoReelItems?.find((x: any) => x.type === "SIZE")?.primaryText ?? null)),
          secondary: pref.size?.secondary ?? (pref.infoReelItems?.find((x: any) => x.type === "SIZE")?.secondaryText ?? null)
        },
        price: {
          primary: pref.price?.primary ?? pref.prices?.primaryPrice ?? null,
          secondary: pref.price?.secondary ?? pref.prices?.secondaryPrice ?? null
        },
        address: pref.address ?? pref.displayAddress ?? pref.text?.pageTitle ?? null,
        postcode: pref.postcode ?? pref.address?.displayAddress?.match(/[A-Z]{1,2}\d[\dA-Z]?\s*\d[A-Z]{2}/i)?.[0] ?? null,
        agent: {
          displayName: pref.branch?.displayName ?? pref.customer?.branchDisplayName ?? null,
          telephone: pref.telephoneNumber ?? pref.contactInfo?.telephoneNumbers?.localNumber ?? null,
          logo: pref.branch?.logo ?? pref.customer?.logoPath ?? null,
          address: pref.branch?.address ?? pref.customer?.displayAddress ?? null
        },
        links: {
          propertyUrl: pref.propertyUrl ?? pref.propertyUrls?.similarPropertiesUrl ?? null,
          schoolCheckerUrl: pref.schoolCheckerUrl ?? null,
          brochureUrl: pref.brochure?.brochures?.[0]?.url ?? pref.brochures?.[0]?.url ?? null,
          soldPricesUrl: pref.soldPricesUrl ?? pref.propertyUrls?.nearbySoldPropertiesUrl ?? null,
          marketInfoUrl: pref.marketInfoUrl ?? null
        },
        media: {
          photos,
          floorplans,
          epcs,
          mapPreviewUrl: pref.location?.mapPreviewUrl ?? pref.staticMapImgUrls?.staticMapImgUrlDesktopLarge ?? null
        },
        location: {
          latitude: pref.location?.latitude ?? pref.streetView?.latitude ?? null,
          longitude: pref.location?.longitude ?? pref.streetView?.longitude ?? null
        },
        html: {
          fullDescription: pref.fullDescription ?? pref.text?.description ?? null,
          propertyDisclaimer: pref.propertyDisclaimer ?? pref.text?.disclaimer ?? null,
          feesApplyText: pref.lettingsInfo?.lettingFeesMessage ?? pref.feesApply?.feesApplyText ?? null
        },
        stations,
        schools,
        statusLabel: pref.status?.label ?? null,
        keyFeatures: pref.keyFeatures ?? null,
        tags: pref.tags ?? null
      };
    }
  } catch (error) {
    console.error("Error building snapshot:", error);
  }

  return {
    key: {
      super_id: root.super_id ?? dc?.super_id ?? null,
      property_url: dc?.metadata?.property_url ?? dc?.data?.property_url ?? null,
      received_at: new Date().toISOString()
    },
    floorplan: {
      inline_csv: fp.inline_csv ?? null,
      csv_url: fp.fp_json_csv_url ?? null,
      total_area_csv_url: fp.total_area_csv_url ?? null,
      json_url: fp.fp_json_file_url ?? null,
      labelme_side_by_side_url: fp.image_labelme_side_by_side_url ?? null
    },
    image_condition: ica,
    data_captured: dc ? {
      context: dc.context ?? null,
      status: dc.status ?? null,
      timestamp: dc.timestamp ?? null,
      summary: dc.summary ?? null,
      metadata: dc.metadata ?? null,
      snapshot: snap
    } : null
  };
}
