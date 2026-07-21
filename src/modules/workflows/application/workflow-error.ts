const KNOWN_RPC_ERRORS = [
  "NOT_AUTHENTICATED",
  "NO_ORG",
  "FORBIDDEN",
  "ENTRY_NOT_FOUND",
  "ENTRY_STATE_INVALID",
  "NO_ORDERS",
  "ORDER_STATE_INVALID",
  "INSUFFICIENT_STOCK",
  "ALREADY_SETTLED",
  "ALREADY_COLLECTED",
  "INVALID_HANDOVER",
] as const;

export type KnownRpcError = (typeof KNOWN_RPC_ERRORS)[number];

export function normalizeRpcError(message: string): KnownRpcError | "RPC_FAILED" {
  return KNOWN_RPC_ERRORS.find((code) => message.includes(code)) ?? "RPC_FAILED";
}
