export const runtime = "nodejs";
export const maxDuration = 5;

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export default {
  fetch(): Response {
    return jsonResponse({
      ok: true,
      route: "api/ping",
      nodeEnv: process.env.NODE_ENV ?? null,
    });
  },
};
