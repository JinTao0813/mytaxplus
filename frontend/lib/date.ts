export function currentUtcYear(): number {
  return new Date().getUTCFullYear()
}

export function nowIsoUtc(): string {
  return new Date().toISOString()
}
