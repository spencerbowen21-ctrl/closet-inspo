// Vercel Serverless Function: /api/generate
// Generates a closet concept image using OpenAI gpt-image-1
// Takes: closet type, dimensions, inspiration photos, optional current closet photo
// Returns: base64 PNG of the generated concept

export const config = {
  maxDuration: 120, // 2 minutes — gpt-image-1 can be slow
};

const ALLOWED_ORIGINS = [
  "https://spencerbowen21-ctrl.github.io",
  "http://localhost:5173",
  "http://localhost:4173",
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://spencerbowen21-ctrl.github.io");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function buildPrompt({ closetType, width, depth, height, unit, notes, styleTags, hasCurrentPhoto, inspoCount }) {
  const typeDescriptions = {
    "walk-in": "walk-in closet with storage on multiple walls",
    "reach-in": "reach-in closet with a single opening",
    "wardrobe-wall": "freestanding wardrobe wall or built-in unit against one wall",
    "mudroom": "mudroom or entry storage area with hooks, cubbies, and benches",
    "pantry": "pantry storage with shelving and dry goods organization",
  };

  const typeDesc = typeDescriptions[closetType] || "closet";
  const styleStr = Array.isArray(styleTags) && styleTags.length > 0
    ? `Style direction: ${styleTags.join(", ")}.`
    : "";

  const dims = (width && depth && height)
    ? `Approximate dimensions: ${width}${unit} wide × ${depth}${unit} deep × ${height}${unit} tall.`
    : "";

  const notesStr = notes ? `Homeowner notes: ${notes}.` : "";

  const refNote = hasCurrentPhoto
    ? `The first reference image shows the homeowner's current space — preserve its approximate geometry, camera angle, and proportions.`
    : `No photo of the current space was provided — design a realistic space matching the dimensions.`;

  const inspoNote = inspoCount > 0
    ? `The ${hasCurrentPhoto ? "remaining" : ""} reference image${inspoCount === 1 ? "" : "s"} show${inspoCount === 1 ? "s" : ""} aesthetic inspiration — blend the materials, finishes, lighting, and organizational style into the design.`
    : "";

  return [
    `Photorealistic interior design concept render of a ${typeDesc}.`,
    dims,
    styleStr,
    notesStr,
    refNote,
    inspoNote,
    "Show organized storage with garments, accessories, and decorative styling. Warm, inviting lighting. High-end residential quality. No people. No text. No labels. Square composition.",
  ].filter(Boolean).join(" ");
}

// Convert a base64 data URL or raw base64 string to a Blob-like object for FormData
function base64ToBlob(b64, mimeType = "image/png") {
  // Strip data URL prefix if present
  const commaIdx = b64.indexOf(",");
  const raw = commaIdx >= 0 ? b64.slice(commaIdx + 1) : b64;
  const buf = Buffer.from(raw, "base64");
  return new Blob([buf], { type: mimeType });
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfigured: OPENAI_API_KEY not set." });
  }

  try {
    const body = req.body || {};
    const {
      closetType = "walk-in",
      width,
      depth,
      height,
      unit = "in",
      notes = "",
      styleTags = [],
      currentPhoto = null, // base64 string (or null)
      inspoPhotos = [],    // array of base64 strings
    } = body;

    const allRefImages = [];
    if (currentPhoto) allRefImages.push(currentPhoto);
    for (const p of inspoPhotos) {
      if (p) allRefImages.push(p);
      if (allRefImages.length >= 4) break; // OpenAI limit
    }

    const prompt = buildPrompt({
      closetType, width, depth, height, unit, notes, styleTags,
      hasCurrentPhoto: !!currentPhoto,
      inspoCount: Math.min(inspoPhotos.length, 4 - (currentPhoto ? 1 : 0)),
    });

    let openaiResponse;

    if (allRefImages.length > 0) {
      // Use /v1/images/edits with reference images
      const form = new FormData();
      form.append("model", "gpt-image-1");
      form.append("prompt", prompt);
      form.append("size", "1024x1024");
      form.append("quality", "medium");
      form.append("n", "1");

      for (let i = 0; i < allRefImages.length; i++) {
        const blob = base64ToBlob(allRefImages[i]);
        form.append("image[]", blob, `ref${i}.png`);
      }

      openaiResponse = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
    } else {
      // No reference images — use pure text-to-image
      openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          size: "1024x1024",
          quality: "medium",
          n: 1,
        }),
      });
    }

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI error:", openaiResponse.status, errText);
      return res.status(502).json({
        error: "Image generation failed.",
        status: openaiResponse.status,
        detail: errText.slice(0, 500),
      });
    }

    const data = await openaiResponse.json();
    const imageB64 = data?.data?.[0]?.b64_json;

    if (!imageB64) {
      return res.status(502).json({ error: "No image returned from OpenAI.", raw: data });
    }

    return res.status(200).json({
      image: `data:image/png;base64,${imageB64}`,
      prompt,
      model: "gpt-image-1",
    });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Internal server error.", detail: String(err.message || err) });
  }
}
