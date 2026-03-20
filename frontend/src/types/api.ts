export interface ApiEnvelope<T> {
  message?: string;
  data: T;
}

export interface ApiErrorPayload {
  message?: string;
  details?: unknown;
}
