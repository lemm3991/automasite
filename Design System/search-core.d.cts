export function normalize(value: unknown): string;
export function terms(value: unknown): string[];
export function searchCatalog(catalog: unknown[], options?: unknown): any[];
export function resolveReference<T>(catalog: T[], id: string): T;
export function similarity(a: unknown, b: unknown): number;
