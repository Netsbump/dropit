export function fromNodeHeaders(headers: Record<string, unknown>) {
  return headers;
}

export function toNodeHandler() {
  return (_req: unknown, _res: unknown) => {};
}
