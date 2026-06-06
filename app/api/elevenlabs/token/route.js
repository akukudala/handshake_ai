export const dynamic = "force-dynamic";

// Mints a short-lived WebRTC conversation token for a (private) ElevenLabs
// Conversational AI agent, keeping ELEVENLABS_API_KEY on the server.
//
// - 200 { conversationToken } when a key + agent_id are available.
// - 204 (No Content) when no key is set → client falls back to connecting
//   directly with the public agentId (only works if the agent is public).
export async function GET(req) {
  const key = process.env.ELEVENLABS_API_KEY;
  const { searchParams } = new URL(req.url);
  const agentId =
    searchParams.get("agent_id") || process.env.ELEVENLABS_AGENT_ID;

  if (!key || !agentId) {
    return new Response(null, { status: 204 });
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(
        agentId
      )}`,
      { headers: { "xi-api-key": key } }
    );
    if (!res.ok) {
      console.error(
        "[elevenlabs/token] failed:",
        res.status,
        await res.text()
      );
      // Let the client try a public connection instead of hard-failing.
      return new Response(null, { status: 204 });
    }
    const data = await res.json();
    const conversationToken = data.token || data.conversation_token;
    if (!conversationToken) return new Response(null, { status: 204 });
    return Response.json({ conversationToken });
  } catch (err) {
    console.error("[elevenlabs/token] error:", err.message);
    return new Response(null, { status: 204 });
  }
}
