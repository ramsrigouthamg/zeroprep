import brand from "../../../config/brand.json";
import v7 from "../../../config/v7.json";
import { ICON_NAMES } from "../../../lib/iconography";
import { DEFAULT_REALTIME_MODEL, isRealtimeModel } from "../../../lib/realtime-models";
import { checkRateLimit, rateLimitResponse } from "../../../lib/request-guards";

const DIRECTOR_INSTRUCTIONS = `
You are ${brand.name}, a live presentation director that turns natural speech into a presentation with zero preparation. Listen to the human presenter and stage visual changes with the stage_visuals function.

This session is in HIGH-SENSITIVITY live composition mode. Every completed speech turn must call stage_visuals exactly once so the UI always receives a director decision.

Decision policy:
- The presentation starts on the ZeroPrep welcome cover. The first substantive turn must use replace and provide a complete scene, replacing that cover. An introduction, thesis, problem statement, or agenda is substantive.
- Produce a visible change on every meaningful turn. Use hold only for noise or an exact repetition; a short continuation should use focus instead.
- UPDATE: When the speaker adds detail to the current idea, use focus or merge_cards so the existing visual evolves in place.
- COMPOSE: Use replace for a new topic, conclusion, contrast, memorable quote, important metric, or clear new beat.
- Recompose the stage after two or three substantive turns even when the topic continues. Change the visual grammar as the story develops instead of leaving one composition on screen too long.
- If the speaker introduces two to four related points, compose one cards scene and progressively merge cards into it. Do not create one scene per point.
- Keep on-screen copy concise and presentation-sized: eyebrows at most 6 words, titles 3–8 words, subtitles at most 22 words, card titles 2–5 words, card bodies 8–20 words, metric labels at most 6 words, and quotes at most 28 words. Put extra detail in later updates instead of shrinking the typography.
- Use hero for a strong new thesis, cards for 2–4 sibling ideas, metric for a number that deserves focus, and quote for a memorable line.
- Every nonblank scene must choose one semantic icon that reinforces its main idea. The icon vocabulary spans business, technology, healthcare, education, science, finance, climate, travel, media, community, retail, and operations. For cards, choose a distinct relevant icon for every card. Prefer meaning over decoration and avoid repeating sparkles when a more specific icon fits.
- Treat cards as a mini visual system: order related ideas clearly so the UI can connect them as a diagram.
- Never narrate UI actions. The function call is the response.

Call stage_visuals once per completed turn. Stay concise so visuals land quickly.
`;

const STAGE_TOOL = {
  type: "function",
  name: "stage_visuals",
  description:
    "Hold, replace, or update the current presentation scene based on the speaker's meaning.",
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      action: {
        type: "string",
        enum: ["replace", "merge_cards", "focus", "hold"],
        description:
          "Use replace for a new semantic beat, merge_cards to evolve a list in place, focus to emphasize the current idea, or hold when no visual change is warranted.",
      },
      caption: {
        type: "string",
        description: "Optional concise supporting sentence for an update.",
      },
      scene: {
        type: "object",
        additionalProperties: false,
        properties: {
          kind: { type: "string", enum: ["hero", "cards", "metric", "quote"] },
          eyebrow: { type: "string", description: "Short section label, no more than 6 words." },
          title: { type: "string", description: "Presentation headline, usually 3–8 words." },
          subtitle: { type: "string", description: "One supporting sentence, no more than 22 words." },
          icon: {
            type: "string",
            enum: ICON_NAMES,
            description: "Semantic icon that best represents the scene's central idea.",
          },
          accent: { type: "string", enum: ["ember", "lime", "sky", "violet"] },
          metric: { type: "string", description: "Compact display value only." },
          metricLabel: { type: "string", description: "Short metric label, no more than 6 words." },
          quote: { type: "string", description: "Memorable line, no more than 28 words." },
          attribution: { type: "string", description: "Short source or speaker label." },
          cards: {
            type: "array",
            maxItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                tag: { type: "string" },
                title: { type: "string", description: "Card headline, 2–5 words." },
                body: { type: "string", description: "One concise supporting sentence, 8–20 words." },
                icon: {
                  type: "string",
                  enum: ICON_NAMES,
                  description: "Distinct semantic icon for this card.",
                },
              },
              required: ["title", "body", "icon"],
            },
          },
        },
      },
      cards: {
        type: "array",
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            tag: { type: "string" },
            title: { type: "string", description: "Card headline, 2–5 words." },
            body: { type: "string", description: "One concise supporting sentence, 8–20 words." },
            icon: {
              type: "string",
              enum: ICON_NAMES,
              description: "Distinct semantic icon for this card.",
            },
          },
          required: ["title", "body", "icon"],
        },
      },
    },
    required: ["action"],
  },
};

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(
    request,
    "realtime-session",
    v7.security.realtime_requests_per_window,
    v7.security.rate_limit_window_ms,
  );
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const apiKey = process.env.OPENAI_API_KEY;
  const requestedModel = request.headers.get("X-ZeroPrep-Realtime-Model");
  const realtimeModel = isRealtimeModel(requestedModel)
    ? requestedModel
    : DEFAULT_REALTIME_MODEL;

  if (!apiKey) {
    return new Response(
      "Live voice needs OPENAI_API_KEY in the server environment. The local demo and typed-line composer are ready now.",
      { status: 503 },
    );
  }

  const sdp = await request.text();
  if (!sdp || sdp.length > 100_000) {
    return new Response("A valid WebRTC offer is required.", { status: 400 });
  }

  const session = {
    type: "realtime",
    model: realtimeModel,
    instructions: DIRECTOR_INSTRUCTIONS,
    output_modalities: v7.realtime.output_modalities,
    max_output_tokens: v7.realtime.max_output_tokens,
    audio: {
      input: {
        transcription: { model: v7.realtime.transcription_model },
        noise_reduction: { type: v7.realtime.noise_reduction },
        turn_detection: v7.realtime.turn_detection,
      },
      output: { voice: v7.realtime.voice },
    },
    tools: [STAGE_TOOL],
    tool_choice: v7.realtime.tool_choice,
  };

  // The Realtime endpoint expects named multipart fields, not file uploads.
  // Native FormData serializes Blob values with a filename, so construct the
  // two text parts explicitly to preserve their required content types.
  const boundary = `${brand.slug}-realtime-${crypto.randomUUID()}`;
  const multipartBody = new TextEncoder().encode(
    [
      `--${boundary}`,
      'Content-Disposition: form-data; name="sdp"',
      "Content-Type: application/sdp",
      "",
      sdp,
      `--${boundary}`,
      'Content-Disposition: form-data; name="session"',
      "Content-Type: application/json",
      "",
      JSON.stringify(session),
      `--${boundary}--`,
      "",
    ].join("\r\n"),
  );

  try {
    const upstream = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: multipartBody,
    });
    const answer = await upstream.text();

    if (!upstream.ok) {
      return new Response(`OpenAI Realtime could not start: ${answer}`, {
        status: upstream.status,
      });
    }

    return new Response(answer, {
      status: 201,
      headers: {
        "Content-Type": "application/sdp",
        "Cache-Control": "no-store",
        "X-ZeroPrep-Realtime-Model": realtimeModel,
      },
    });
  } catch {
    return new Response("Could not reach the OpenAI Realtime API.", { status: 502 });
  }
}
