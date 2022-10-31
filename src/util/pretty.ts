export function pluralize(value: number, word: string): string {
    return value === 1 ? word : `${word}s`;
}
