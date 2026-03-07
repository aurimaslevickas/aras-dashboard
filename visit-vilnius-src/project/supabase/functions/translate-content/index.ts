import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "pl", name: "Polish" },
  { code: "de", name: "German" },
  { code: "ru", name: "Russian" },
  { code: "fr", name: "French" },
];

async function translateText(text: string, targetLang: string, apiKey: string): Promise<string> {
  if (!text || !text.trim()) return "";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional translator specializing in travel and tourism content about Vilnius, Lithuania. Translate the given text to ${targetLang}. Keep the same tone, style and formatting. If the text contains HTML tags, preserve them. Return only the translated text without any explanation.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: apiKeySetting } = await supabase
      .from("site_settings")
      .select("value_lt")
      .eq("key", "openai_api_key")
      .maybeSingle();

    const apiKey = apiKeySetting?.value_lt;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API raktas nesukonfigūruotas nustatymuose" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { fields, sourceLanguage = "lt" } = body;

    if (!fields || typeof fields !== "object") {
      return new Response(
        JSON.stringify({ error: "Trūksta 'fields' parametro" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result: Record<string, Record<string, string>> = {};

    for (const lang of LANGUAGES) {
      if (lang.code === sourceLanguage) continue;
      result[lang.code] = {};

      for (const [fieldName, fieldValue] of Object.entries(fields)) {
        if (typeof fieldValue !== "string" || !fieldValue.trim()) {
          result[lang.code][fieldName] = "";
          continue;
        }

        const translated = await translateText(fieldValue, lang.name, apiKey);
        result[lang.code][fieldName] = translated;

        if (fieldName === "name" || fieldName === "title") {
          result[lang.code]["slug"] = generateSlug(translated);
        }
      }
    }

    return new Response(JSON.stringify({ translations: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Klaida verčiant turinį" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
