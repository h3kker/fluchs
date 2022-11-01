import moment from 'moment';

export function pluralize(value: number, word: string): string {
    return value === 1 ? word : `${word}s`;
}

export function prettyDateTime(dt: Date | null): string {
    return dt ?
        moment(dt).format('YYYY-MM-DD HH:mm') :
        '-';
}

export function dateAgo(dt: Date | string | null): string {
    return dt ?
        moment(dt).fromNow() :
        '-';
}
