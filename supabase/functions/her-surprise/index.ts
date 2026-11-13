
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const privateContent = {
  intro: "You are my favourite part of every day. ❤️",

  story: [
    {
      date: "The beginning",
      title: "Where it all started",
      description: "A little moment that became something beautiful."
    },
    {
      date: "Our journey",
      title: "Making memories",
      description: "Every little adventure with you means something to me."
    },
    {
      date: "Today",
      title: "Still choosing you",
      description: "And I hope we keep making memories together."
    }
  ],

  reasons: [
    "Your smile makes my day.",
    "You make ordinary moments special.",
    "I can be myself around you.",
    "You make life more beautiful."
  ],

  letter: "My love, I made this little corner of the internet just for you. I hope it reminds you how special you are to me. No matter where life takes us, I want to keep creating beautiful memories with you. ❤️",

  surprise: "One more thing... I love you. Always. ❤️"
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    const correctPassword = Deno.env.get("SURPRISE_PAGE_PASSWORD");

    if (!correctPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { password } = await req.json();

    if (
      typeof password !== "string" ||
      password !== correctPassword
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Incorrect password"
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        content: privateContent
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );

  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Something went wrong"
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
