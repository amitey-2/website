

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const privateContent = {

  intro:
    "You make ordinary moments feel extraordinary. I made this little place because you deserve something special.",

  story: [
    {
      date: "THE BEGINNING",
      title: "Where it all started",
      description:
        "This is where our beautiful story began. Add your favourite memory here."
    },
    {
      date: "A SPECIAL MOMENT",
      title: "One I'll always remember",
      description:
        "Some moments stay in your heart forever. This is one of mine."
    },
    {
      date: "TODAY & ALWAYS",
      title: "Our next chapter",
      description:
        "There are still so many beautiful memories waiting for us."
    }
  ],

  reasons: [
    "The way you make me smile.",
    "Your beautiful little personality.",
    "The way you care about people.",
    "Even the smallest moments with you.",
    "Your smile on difficult days.",
    "Simply being yourself."
  ],

  letter:
    "My love,\n\nI don't always find the perfect words to explain how much you mean to me. Sometimes the simplest moments become the most beautiful memories, just because I get to share them with you.\n\nI made this little corner of the internet for you. It isn't something expensive or extraordinary. It's simply a small reminder that someone thinks about you, appreciates you, and wants to make you smile.\n\nThank you for being you. I hope we continue making beautiful memories together.\n\nYou deserve all the happiness in the world.\n\nWith love,",

  surprise:
    "If I could choose one place to be, it would be wherever you are. And if I could make one wish, it would be for us to keep finding reasons to smile together. I love you. ♡"

};


Deno.serve(async (req: Request) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }

  try {

    const expectedPassword =
      Deno.env.get("SURPRISE_PAGE_PASSWORD");

    if (!expectedPassword) {
      throw new Error("Password is not configured");
    }

    const body = await req.json();

    const suppliedPassword =
      typeof body.password === "string"
        ? body.password
        : "";

    if (
      suppliedPassword.length < 1 ||
      suppliedPassword.length > 128 ||
      suppliedPassword !== expectedPassword
    ) {

      return new Response(
        JSON.stringify({
          success: false,
          error: "Incorrect password"
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
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

  } catch (error) {

    console.error(error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Server configuration error"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );

  }

});
