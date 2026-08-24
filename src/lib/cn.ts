export type ClassValue = string | undefined | null | false | Record<string, boolean>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const v of inputs) {
    if (!v) continue;
    if (typeof v === 'string') out.push(v);
    else for (const [k, on] of Object.entries(v)) if (on) out.push(k);
  }
  return out.join(' ');
}
