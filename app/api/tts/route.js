import { synthesizeSpeech } from "@/lib/elevenlabs";

export const dynamic = "force-dynamic";

// Returns audio/mpeg for the supplied text via ElevenLabs.
// 204 (No Content) signals the client to use browser speech synthesis instead.
export async function POST(req) {
  const { text } = await req.json();
  if (!text) {
    return new Response(JSON.stringify({ error: "text is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const audio = await synthesizeSpeech(text);
    if (!audio) {
      // No ElevenLabs key configured — tell the client to fall back.
      return new Response(null, { status: 204 });
    }
    return new Response(audio, {
      status: 200,
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    console.error("[tts] ElevenLabs failed:", err.message);
    // Soft-fail to browser TTS rather than breaking the demo.
    return new Response(null, { status: 204 });
  }
}
