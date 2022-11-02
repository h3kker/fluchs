import { defineStore } from "pinia";
import { BehaviorSubject } from "rxjs";
import { filter as _filter, map as _map, isEqual as _isEqual, cloneDeep as _cloneDeep } from "lodash";

import { useRootStore } from "./root";
import type { Feed } from "./feeds";

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
}

type entriesState = "init" | "loading" | "ready" | "error";
type entryStatus = "read" | "unread" | "removed";
type entrySortField = "id" | "status" | "published_at" | "category_title" | "category_id";
type fetchType = "all" | "category" | "feed";

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

interface CallParams {
    id: number;
    type: fetchType;
    filter: EntryFilter;
}

export const useEntriesStore = defineStore({
    id: "entries",
    state: () => ({
        entries: [] as Entry[],
        filter: {
            status: "unread",
            order: "published_at",
            direction: "desc",
            limit: 25,
            offset: 0,
        } as EntryFilter,
        state: new BehaviorSubject<entriesState>("init"),
        total: 0,
        _prevCall: undefined as CallParams | undefined,
        _markedList: [] as Entry[],
    }),
    actions: {
        async _getEntries(id: number, type: fetchType, force = false) {
            const root = useRootStore();
            this.state.next("loading");
            const callParams: CallParams = {
                id: id,
                type: type,
                filter: _cloneDeep(this.filter),
            };
            if (!force && _isEqual(this._prevCall, callParams)) {
                this.state.next("ready");
                return Promise.resolve(this.entries);
            }
            this.entries = [];

            let url;
            switch (type) {
                case "feed":
                    url = `/v1/feeds/${id}/entries`;
                    break;
                case "category":
                    url = `/v1/categories/${id}/entries`;
                    break;
                case "all":
                    url = `/v1/entries`;
                    break;
            }
            await root.backend
                .get(url, { params: this.filter })
                .then((r) => {
                    this.total = r.data.total;
                    this.entries = _map(r.data.entries, (e) => {
                        return e;
                    });
                    this.state.next("ready");
                    this._prevCall = callParams;
                })
                .catch((e) => {
                    this.state.next("error");
                    root.showError(e);
                });
            return this.entries;
        },
        async getFeedEntries(feedId: number, force = false): Promise<Entry[]> {
            return this._getEntries(feedId, "feed", force);
        },
        async getCategoryEntries(catId: number, force = false): Promise<Entry[]> {
            return this._getEntries(catId, "category", force);
        },
        async getAllEntries(force = false): Promise<Entry[]> {
            return this._getEntries(0, "all", force);
        },
        async markAsRead(entry: Entry): Promise<void> {
            const root = useRootStore();
            await root.backend
                .put("/v1/entries", { entry_ids: [entry.id], status: "read" })
                .then(() => {
                    entry.status = "read";
                })
                .catch((e) => {
                    root.showError(e);
                });
        },
        async markEntriesAsRead(entries: Entry[]): Promise<void> {
            const root = useRootStore();
            const unreadEntries = _filter(entries, (e) => e.status === "unread");
            const idList = _map(unreadEntries, "id");
            if (idList.length === 0) {
                return;
            }
            await root.backend
                .put("/v1/entries", { entry_ids: idList, status: "read" })
                .then(() => {
                    unreadEntries.forEach((e) => (e.status = "read"));
                    this._markedList = unreadEntries;
                })
                .catch((e) => {
                    root.showError(e);
                });
        },
        async undoMarkEntries(): Promise<void> {
            const root = useRootStore();
            const idList = _map(this._markedList, "id");
            if (idList.length === 0) {
                return Promise.resolve();
            }
            await root.backend
                .put("/v1/entries", { entry_ids: idList, status: "unread" })
                .then(() => {
                    this._markedList.forEach((e) => (e.status = "unread"));
                })
                .catch((e) => {
                    root.showError(e);
                });
        },
        async markAsUnread(entry: Entry): Promise<void> {
            const root = useRootStore();
            await root.backend
                .put("/v1/entries", { entry_ids: [entry.id], status: "unread" })
                .then(() => {
                    entry.status = "unread";
                })
                .catch((e) => {
                    root.showError(e);
                });
        },
        async toggleStar(entry: Entry): Promise<void> {
            const root = useRootStore();
            await root.backend
                .put(`/v1/entries/${entry.id}/bookmark`)
                .then(() => {
                    entry.starred = !entry.starred;
                })
                .catch((e) => {
                    root.showError(e);
                });
        },
    },
});
