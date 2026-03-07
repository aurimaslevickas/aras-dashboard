import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: userRow } = await serviceClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (userRow?.role !== "admin" && userRow?.role !== "editor") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, table, payload, match, rows } = body;

    let result: any;

    if (action === "upsert" && table === "category_sections") {
      result = await serviceClient
        .from("category_sections")
        .upsert(payload, { onConflict: "key" });
    } else if (action === "update" && table === "site_settings") {
      result = await serviceClient
        .from("site_settings")
        .update(payload)
        .eq("key", match.key);
    } else if (action === "update_many" && table === "site_settings") {
      for (const row of rows) {
        const { key, ...data } = row;
        const r = await serviceClient
          .from("site_settings")
          .update({ ...data })
          .eq("key", key);
        if (r.error) {
          return new Response(JSON.stringify({ error: r.error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (action === "insert" && table === "hero_season_images") {
      result = await serviceClient
        .from("hero_season_images")
        .insert(payload);
    } else if (action === "update" && table === "hero_season_images") {
      result = await serviceClient
        .from("hero_season_images")
        .update(payload)
        .eq("id", match.id);
    } else if (action === "delete" && table === "hero_season_images") {
      result = await serviceClient
        .from("hero_season_images")
        .delete()
        .eq("id", match.id);
    } else if (action === "insert" && table === "media_library") {
      result = await serviceClient
        .from("media_library")
        .insert(payload);
    } else if (action === "delete" && table === "media_library") {
      const { data: mediaRow } = await serviceClient
        .from("media_library")
        .select("url")
        .eq("id", match.id)
        .maybeSingle();

      if (mediaRow?.url) {
        const urlMatch = mediaRow.url.match(/\/storage\/v1\/object\/public\/media\/(.+)/);
        if (urlMatch) {
          await serviceClient.storage.from("media").remove([urlMatch[1]]);
        }
      }

      result = await serviceClient
        .from("media_library")
        .delete()
        .eq("id", match.id);
    } else if (action === "update" && table === "listings") {
      result = await serviceClient
        .from("listings")
        .update(payload)
        .eq("id", match.id);
    } else if (action === "insert" && table === "listings") {
      result = await serviceClient
        .from("listings")
        .insert(payload);
    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (result?.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
