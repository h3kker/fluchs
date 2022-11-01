import { defineStore } from "pinia";
import { BehaviorSubject } from 'rxjs';
import { map as _map } from 'lodash';

import { useRootStore } from "./root";
import type { Feed } from './feeds';

export interface Entry {
    id: number;
    user_id: number;
    feed_id: number;
    title: string;
    url: string;
    comments_url: string;
    author: string;
    content: string;
    hash: string;
    published_at: Date;
    created_at: Date;
    status: string;
    share_code: number;
    starred: boolean;
    reading_time: number;
    enclosures: number;
    feed: Feed;
};

type entriesState = "init" | "loading" | "ready" | "error";
type entryStatus = "read" | "unread" | "removed";
type entrySortField = "id" | "status" | "published_at" | "category_title" | "category_id";

interface EntryFilter {
    status: entryStatus;
    offset: number;
    limit: number;
    order: entrySortField;
    direction: "asc" | "desc";
    before: number;
    after: number;
    before_entry_id: number;
    after_entry_id: number;
    starred: boolean;
    search: string;
    category_id: number;
}

export const useEntriesStore = defineStore({
    id: "entries",
    state: () => ({
        entries: [] as Entry[],
        filter: {
            status: 'unread',
            order: 'published_at',
            direction: 'desc',
            limit: 25,
            offset: 0,
        } as EntryFilter,
        state: new BehaviorSubject<entriesState>("init"),
        total: 0,
    }),
    actions: {
        async getEntries(feedId: number): Promise<Entry[]> {
            const root = useRootStore();
            this.state.next('loading');
            await root.backend
                .get(`/v1/feeds/${feedId}/entries`, { params: this.filter })
                .then((r) => {
                    this.total = r.data.total;
                    this.entries = _map(r.data.entries, e => {
                        return e;
                    });
                    this.state.next("ready");
                })
                .catch((e) => {
                    this.state.next("error");
                    root.showError(e);
                });
            return this.entries;
        },
        async markAsRead(entry: Entry): Promise<void> {
            const root = useRootStore();
            await root.backend
                .put('/v1/entries', { entry_ids: [ entry.id ], status: 'read' })
                .then((r) => {
                    entry.status = 'read';
                })
                .catch((e) => {
                    root.showError(e);
                })
        },
        async markAsUnread(entry: Entry): Promise<void> {
            const root = useRootStore();
            await root.backend
                .put('/v1/entries', { entry_ids: [ entry.id ], status: 'unread' })
                .then((r) => {
                    entry.status = 'unread';
                })
                .catch((e) => {
                    root.showError(e);
                })
        },
        async toggleStar(entry: Entry): Promise<void> {
            const root = useRootStore();
            await root.backend
                .put(`/v1/entries/${entry.id}/bookmark`)
                .then((r) => {
                    entry.starred = !entry.starred;
                })
                .catch((e) => {
                    root.showError(e);
                })
        },
    },
});