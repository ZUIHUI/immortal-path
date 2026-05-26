export default function handler(_request: any, response: any) {
  response.status(200).json({
    ok: true,
    route: "api/ping",
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}
