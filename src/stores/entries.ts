import { defineStore } from "pinia";
import { BehaviorSubject } from "rxjs";
import { filter as _filter, map as _map, isEqual as _isEqual, cloneDeep as _cloneDeep } from "lodash";

import { useRootStore } from "./root";
import { useFeedsStore, type Feed } from "./feeds";
import { useCategoriesStore } from "./categories";

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
type fetchType = "all" | "category" | "feed" | "starred";

interface EntryFilter {
    status?: entryStatus | entryStatus[];
    offset: number;
    limit: number;
    order?: entrySortField;
    direction?: "asc" | "desc";
    before?: number;
    after?: number;
    before_entry_id?: number;
    after_entry_id?: number;
    starred?: boolean;
    search?: string;
    category_id?: number;
}

interface CallParams {
    id: number;
    url: string;
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
                url: '',
                type: type,
                filter: _cloneDeep(this.filter),
            };

            switch (type) {
                case "feed":
                    callParams.url = `/v1/feeds/${id}/entries`;
                    break;
                case "category":
                    callParams.url = `/v1/categories/${id}/entries`;
                    break;
                case "all":
                    callParams.url = `/v1/entries`;
                    break;
                case "starred":
                    callParams.url = `/v1/entries`;
                    callParams.filter.starred = true;
                    break;
            }
            if (callParams.filter.status === 'read') {
                callParams.filter.status = ['unread', 'read'];
            }
            if (!force && _isEqual(this._prevCall, callParams)) {
                this.state.next("ready");
                return Promise.resolve(this.entries);
            }
            this.entries = [];
            await root.backend
                .get(callParams.url, { params: callParams.filter })
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
        async getStarredEntries(force = false): Promise<Entry[]> {
            return this._getEntries(0, "starred", force);
        },
        async markAsRead(entry: Entry): Promise<void> {
            const root = useRootStore();
            if (entry.status === 'read') {
                return;
            }
            await root.backend
                .put("/v1/entries", { entry_ids: [entry.id], status: "read" })
                .then(() => {
                    entry.status = "read";
                    this._updateReadCounters(entry, 1);
                })
                .catch((e) => {
                    root.showError(e);
                });
        },
        async markAsRemoved(entry: Entry): Promise<void> {
            const root = useRootStore();
            await root.backend
                .put("/v1/entries", { entry_ids: [ entry.id ], status: "removed" })
                .then(() => {
                    entry.status = "removed";
                })
                .catch((e) => {
                    root.showError(e);
                });
        },
        async markEntriesAsRead(entries: Entry[]): Promise<void> {
            const root = useRootStore();
            const feeds = useFeedsStore();
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
                    feeds.getFeedCounters();
                })
                .catch((e) => {
                    root.showError(e);
                });
        },
        async undoMarkEntries(): Promise<void> {
            const root = useRootStore();
            const feeds = useFeedsStore();
            const idList = _map(this._markedList, "id");
            if (idList.length === 0) {
                return Promise.resolve();
            }
            await root.backend
                .put("/v1/entries", { entry_ids: idList, status: "unread" })
                .then(() => {
                    this._markedList.forEach((e) => (e.status = "unread"));
                    feeds.getFeedCounters();
                })
                .catch((e) => {
                    root.showError(e);
                });
        },
        async markAsUnread(entry: Entry): Promise<void> {
            const root = useRootStore();
            if (entry.status === 'unread') {
                return;
            }
            await root.backend
                .put("/v1/entries", { entry_ids: [entry.id], status: "unread" })
                .then(() => {
                    entry.status = "unread";
                    this._updateReadCounters(entry, -1);
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
        _updateReadCounters(entry: Entry, count: number) {
            const feeds = useFeedsStore();
            const cats = useCategoriesStore();
            const feed = feeds.getFeedById(entry.feed_id);
            feed.unread -= count;
            feed.read += count;
            const cat = cats.getCategoryById(feed.category.id);
            if (cat) {
                cat.total_read += count;
                cat.total_unread -= count;
            }
        }
    },
});
