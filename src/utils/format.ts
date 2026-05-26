export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatSigned(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  return `${value}`;
}

export function formatRealmName(name: string, stageName: string): string {
  return stageName ? `${name}${stageName === "凡胎肉身" ? "" : stageName}` : name;
}
