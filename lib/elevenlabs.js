// ElevenLabs text-to-speech wrapper.
// Returns an MP3 Buffer for the AI agent's speech. If no key is configured,
// the caller falls back to the browser's built-in speech synthesis.

async function synthesizeSpeech(text) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return null; // signal: no audio available, use browser TTS fallback

  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(
      `ElevenLabs API error ${res.status}: ${await res.text()}`
    );
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

module.exports = { synthesizeSpeech };
