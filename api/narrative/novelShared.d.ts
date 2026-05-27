export function parseBody(request: { body?: unknown }): any;
export function toApiErrorPayload(error: unknown, fallback: string): {
  error: string;
  code?: string | number;
  type?: string;
};
export function generateNovelScene(kind: string, payload: any): Promise<any>;
