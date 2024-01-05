export type BackoffRequestType = RequestInit | undefined;

export type AsyncExponentialBackoff = <T extends BackoffRequestType>(
  endpoint: string, retries: number, timeout: number, request: T, depth?: number
) => Promise<Response>;