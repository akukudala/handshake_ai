# 🎧 Live "Lead Desk" — ElevenLabs Conversational AI setup

Handshake AI lets a rep **call an AI helpdesk and talk to it** to get briefed on a
lead before a meeting. The rep speaks into the mic and asks things like *"what do I
need to know?"*, *"what are their pain points?"*, *"what should I pitch?"* — and the
**Handshake Lead Desk** answers out loud, in real time, using that lead's data.

The app injects the lead's profile + the helpdesk persona into the call for you, so the
agent in the dashboard can stay almost empty.

> Without this, the app plays a **scripted briefing preview** (no mic, near-zero
> credits) so the demo still works.

---

## 1. Create the agent (~2 min)

ElevenLabs dashboard → **Conversational AI** → **Create agent**.

- **Name:** `Handshake Lead Desk` (anything).
- **Voice:** pick any (e.g. Rachel).
- **First message / System prompt:** you can leave these as anything — **the app
  overrides them per call** with the helpdesk persona + the specific lead's data.

## 2. Enable overrides (important)

So the app can inject each lead's briefing, allow these to be overridden:

**Agent → Security (or Advanced) → Enable overrides** for:
- ✅ **System prompt**
- ✅ **First message**

> If you skip this, the agent still connects but won't know the specific lead — it'll
> use whatever prompt is in the dashboard. (Belt-and-suspenders: the app also sends a
> `lead_context` dynamic variable, so you *can* instead put `{{lead_context}}` in the
> dashboard prompt rather than enabling overrides.)

## 3. Wire it into the app

Copy the agent id (`agent_xxxxxxxxxxxx`) into `.env.local`:

```
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxx
```

The call mints a private token server-side, so make sure your `ELEVENLABS_API_KEY`
has **Conversational AI** access (a Text-to-Speech-only key won't mint tokens — either
add the scope, or make the agent **public**, which needs no key for the call).

Restart:

```bash
npm run dev
```

## 4. Use it

Open any prospect → the panel now reads **"📞 Call the Lead Desk"**. Click it, allow the
mic, and **talk**:

- *"Give me the rundown on this lead."*
- *"What are their biggest pain points?"*
- *"What should I open with?"*
- *"Any objections I should expect?"*

Click **■ Hang Up** → the conversation transcript is saved to lead memory and your
Meeting Prep Card is generated from it.

> The **"Preview a scripted briefing instead"** link under the panel is always there as
> a no-mic fallback for stage demos.

## How it works in code

| Piece | File |
| --- | --- |
| Helpdesk persona + this lead's briefing (injected as session overrides) | [lib/helpdeskPrompt.js](../lib/helpdeskPrompt.js) |
| Live two-way call UI (rep talks, desk answers) | [components/HelpdeskCallPanel.js](../components/HelpdeskCallPanel.js) |
| Mints private WebRTC token (key stays server-side) | [app/api/elevenlabs/token/route.js](../app/api/elevenlabs/token/route.js) |
| Saves the briefing transcript to lead memory | [app/api/voice-call/route.js](../app/api/voice-call/route.js) |
| Scripted no-mic fallback | [lib/voiceScript.js](../lib/voiceScript.js) + [components/VoiceCallPanel.js](../components/VoiceCallPanel.js) |

The flow: browser gets a token from `/api/elevenlabs/token` → opens a WebRTC session,
passing the lead's briefing as `overrides.agent.prompt` + `firstMessage` → rep and desk
talk → on hang-up the transcript posts to `/api/voice-call` and triggers `/api/prep`.
