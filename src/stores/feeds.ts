import { defineStore } from "pinia";

import { useRootStore } from "./root";
import type { Category } from "./categories";
import { useCategoriesStore } from "./categories";

import { values as _values, each as _each, size as _size, filter as _filter, find as _find, map as _map } from "lodash";

import { BehaviorSubject } from "rxjs";

interface IconSpec {
    feed_id: number;
    icon_id: number;
}

export interface Feed {
    id: number;
    user_id: number;
    title: string;
    site_url: string;
    feed_url: string;
    checked_at: Date;
    etag_header: string;
    last_modified_header: Date;
    parsing_error_message: string;
    parsing_error_count: number;
    scraper_rules: string;
    rewrite_rules: string;
    crawler: boolean;
    blocklist_rules: string;
    keeplist_rules: string;
    user_agent: string;
    username: string;
    password: string;
    disabled: boolean;
    ignore_http_cache: boolean;
    fetch_via_proxy: boolean;
    category: Category;
    icon: IconSpec;
    read: number;
    unread: number;
}

type feedsState = "init" | "loading" | "ready" | "error";

export const useFeedsStore = defineStore({
    id: "feeds",
    state: () => ({
        _feeds: {} as { [key: number]: Feed },
        state: new BehaviorSubject<feedsState>("init"),
        icons: {} as { [key: number]: string },
    }),
    getters: {
        feeds: (state) => _values(state._feeds),
        getFeedById: (state) => {
            return (id: number) => state._feeds[id];
        },
    },
    actions: {
        async getFeeds(refresh = false): Promise<Feed[]> {
            const root = useRootStore();
            const cats = useCategoriesStore();
            if (!refresh && _size(this._feeds) > 0) {
                return Promise.resolve(this.feeds);
            }
            this.state.next("loading");
            await root.backend
                .get("/v1/feeds")
                .then((r) => {
                    _each(r.data, (f) => {
                        f.read = 0;
                        f.unread = 0;
                        this._feeds[f.id] = f;
                    });
                })
                .then(() => {
                    return cats.getCategories();
                })
                .then((cats) => {
                    cats.forEach((cat) => {
                        cat.feeds = _filter(this._feeds, (f) => f.category.id === cat.id);
                    });
                    this.state.next("ready");
                })
                .catch((e) => {
                    this.state.next("error");
                    root.showError(e);
                });

            return this.feeds;
        },
        async getFeed(id: number): Promise<Feed | undefined> {
            const root = useRootStore();
            const cats = useCategoriesStore();
            let ret: Feed | undefined = undefined;
            await root.backend
                .get(`/v1/feeds/${id}`)
                .then((r) => {
                    ret = r.data as Feed;
                    const oldFeed = this._feeds[id];
                    if (oldFeed) {
                        ret.unread = oldFeed.unread;
                        ret.read = oldFeed.read;
                    }
                    this._feeds[ret.id] = ret;
                    return ret;
                })
                .then((feed) => {
                    cats.getCategories().then((cats) => {
                        const feedCat = _find(cats, (c) => c.id === feed.category.id);
                        if (feedCat) {
                            feedCat.feeds = _map(feedCat.feeds, (f) => (f.id === feed.id ? feed : f));
                        }
                    });
                })
                .then(() => {
                    return this.getFeedCounters();
                })
                .catch((e) => {
                    root.showError(e);
                });
            return ret;
        },
        async refresh(feed: Feed): Promise<Feed> {
            const root = useRootStore();
            let ret = feed;
            await root.backend
                .put(`/v1/feeds/${feed.id}/refresh`)
                .then(() => {
                    return this.getFeed(feed.id);
                })
                .then((upd) => {
                    if (upd) ret = upd;
                })
                .catch((e) => {
                    root.showError(e);
                });
            return ret;
        },
        async getFeedCounters() {
            const root = useRootStore();
            const cats = useCategoriesStore();
            await root.backend
                .get("/v1/feeds/counters")
                .then((r) => {
                    _each(this._feeds, f => {
                        f.read = r.data.reads[f.id] || 0;
                        f.unread = r.data.unreads[f.id] || 0;
                    });
                })
                .catch((e) => root.showError(e));

            cats.resetCounters();
        },
        async markAsRead(feed: Feed) {
            const root = useRootStore();
            await root.backend
                .put(`/v1/feeds/${feed.id}/mark-all-as-read`)
                .then(() => {
                    this.getFeedCounters();
                })
                .catch((e) => root.showError(e));
        },
        async getIcon(feed: Feed): Promise<string> {
            const root = useRootStore();
            if (!(feed.id in this.icons)) {
                await root.backend
                    .get(`/v1/feeds/${feed.id}/icon`)
                    .then((r) => {
                        this.icons[feed.id] = r.data.data;
                        return r.data.data;
                    })
                    .catch((e) => root.showError(e));
                }
            return this.icons[feed.id];
        }
    },
});
