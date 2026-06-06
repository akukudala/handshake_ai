# 🤝 Handshake AI

An AI-assisted **sales prospecting portal**. A rep finds nearby prospects, books a
meeting, runs a **pre-meeting AI voice call** (ElevenLabs), and gets an auto-generated
**Meeting Prep Card** (Claude / OpenAI). Every call transcript, AI summary, appointment,
and note is saved to a **lead-memory / interaction-history** store so the AI remembers
prior interactions for future follow-ups.

> Built for a hackathon: **end-to-end working demo first**. It runs with **zero API keys**
> using built-in mock fallbacks, and lights up real audio + LLM output when you add keys.

---

## ✨ Features

- **Dashboard** — nearby prospects with search + filters (distance, industry, score, status) and sorting.
- **Prospect detail page** — full profile, pain points, revenue, current provider, status.
- **Appointment creation panel** — book meetings; auto-advances prospect status.
- **Call the Lead Desk** — the rep **calls an AI helpdesk and talks to it** to get briefed on the lead ("who are they?", "what are their pain points?", "what should I pitch?"). Real two-way ElevenLabs Conversational AI in the browser when an agent is configured ([setup guide](docs/ELEVENLABS_AGENT_SETUP.md)); a scripted no-mic briefing otherwise.
- **Meeting Prep Card** — 2-sentence summary, interest level, pain points, conversation starter, recommended pitch, objection to prep for, next best action, and context from history.
- **Lead memory timeline** — every Voice Call / Appointment / Note / Prep Summary, with expandable transcripts.
- **Rep notes** — saved to memory and fed into the prep prompt.

## 🧱 Tech stack

| Layer    | Choice                                             |
| -------- | -------------------------------------------------- |
| Frontend | Next.js 14 (App Router) + React 18                 |
| Backend  | Next.js API routes (Node)                          |
| Database | File-backed JSON (`data/db.json`, no native deps)  |
| Voice    | ElevenLabs TTS (browser speech-synthesis fallback) |
| LLM      | Anthropic Claude **or** OpenAI (mock fallback)     |
| Styling  | Tailwind CSS                                        |

## 🚀 Setup

```bash
# 1. Install
npm install

# 2. (Optional) add your keys — the app works without them
cp .env.local.example .env.local
#   then edit .env.local

# 3. Run
npm run dev
# open http://localhost:3000
```

### Environment variables (`.env.local`)

```
ELEVENLABS_API_KEY=        # optional — enables real AI-agent audio
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Pick ONE LLM provider (Anthropic is tried first if both are set)
ANTHROPIC_API_KEY=         # optional — enables real prep generation
ANTHROPIC_MODEL=claude-sonnet-4-6

OPENAI_API_KEY=            # optional
OPENAI_MODEL=gpt-4o-mini

NEXT_PUBLIC_ELEVENLABS_AGENT_ID=   # optional — enables a REAL two-way in-browser AI call
```

> **Want a real live AI voice call** (not the simulation)? See the 3-minute
> [ElevenLabs Conversational AI setup guide](docs/ELEVENLABS_AGENT_SETUP.md).

**No keys?** No problem:

- No `ELEVENLABS_API_KEY` → the browser's built-in speech synthesis voices the agent.
- No LLM key → a deterministic heuristic generates a realistic prep card.

## 🧭 Demo flow

1. Land on the **dashboard** → browse nearby prospects, filter by distance/industry/score/status.
2. Open a **prospect** (e.g. _Bluebird Coffee Roasters_).
3. **Create an appointment** in the right panel.
4. Click **▶ Start AI Voice Call** — watch the status indicator, hear the agent, and see the transcript stream in.
5. The **Meeting Prep Card** generates automatically when the call ends.
6. Add a **rep note** and hit **↻ Regenerate** to fold it into the prep.
7. Scroll to **Lead Memory** to see the saved transcript, summary, appointment, and notes.

## 📁 Project structure

```
app/
  layout.js                      # shell + header
  page.js                        # dashboard (prospect list + filters)
  prospects/[id]/page.js         # prospect detail (orchestrates the workflow)
  api/
    prospects/route.js           # GET all prospects + rep
    prospects/[id]/route.js      # GET prospect + appointments + interactions
    appointments/route.js        # POST create appointment
    interactions/route.js        # POST save a rep note
    voice-call/route.js          # POST simulate the AI voice call (returns transcript)
    prep/route.js                # POST generate + save the Meeting Prep Card
    tts/route.js                 # POST text → ElevenLabs audio (204 = use browser TTS)
components/
  ui.js                          # badges, pills, section titles
  VoiceCallPanel.js              # call simulation + audio playback
  AppointmentPanel.js            # appointment form + list
  MeetingPrepCard.js             # prep card renderer
  HistoryTimeline.js             # lead-memory timeline
  RepNotes.js                    # rep notes editor
lib/
  db.js                          # JSON "database" (prospects, appointments, interaction_history)
  seedData.js                    # mock prospects + rep
  voiceScript.js                 # agent script + transcript simulator
  llm.js                         # Anthropic/OpenAI prep generation + mock fallback
  elevenlabs.js                  # ElevenLabs TTS wrapper
data/
  db.json                        # auto-generated on first run (git-ignored)
```

## 🗄️ Data model

- **prospects** — `prospect_id, business_name, owner_name, industry, address, distance_miles, phone_number, match_score, current_provider, estimated_revenue, business_description, likely_pain_points, status`
- **appointments** — `appointment_id, prospect_id, rep_id, appointment_date, appointment_time, appointment_status, notes`
- **interaction_history** (lead memory) — `interaction_id, prospect_id, rep_id, interaction_type, transcript, ai_summary, pain_points, conversation_starters, recommended_pitch, next_best_action, created_at`

> To reset the demo data, delete `data/db.json` — it's re-seeded from `lib/seedData.js` on the next request.

## 🔌 Going further (real ElevenLabs Conversational AI)

This MVP simulates the call to keep the demo reliable. To wire up real
[ElevenLabs Conversational AI](https://elevenlabs.io/conversational-ai), replace
`app/api/voice-call/route.js` with a session that streams agent + caller turns from
their websocket/SDK, then keep posting the resulting transcript to `app/api/prep`.
