import { defineStore } from "pinia";

import { useRootStore } from "./root";
import type { Category } from "./categories";
import { useCategoriesStore } from "./categories";

import { values as _values, each as _each, size as _size, filter as _filter } from "lodash";

import { BehaviorSubject } from "rxjs";

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
    icon: any;
    read: number;
    unread: number;
}

type feedsState = "init" | "loading" | "ready" | "error";

export const useFeedsStore = defineStore({
    id: "feeds",
    state: () => ({
        _feeds: {} as { [key: number]: Feed },
        state: new BehaviorSubject<feedsState>("init"),
    }),
    getters: {
        feeds: (state) => _values(state._feeds),
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
                .catch((e) => {
                    root.showError(e);
                });

            cats.getCategories().then((cats) => {
                cats.forEach((cat) => {
                    cat.feeds = _filter(this._feeds, (f) => f.category.id === cat.id);
                });
                this.state.next("ready");
            });
            return this.feeds;
        },
        async getFeedCounters() {
            const root = useRootStore();
            const cats = useCategoriesStore();
            await root.backend
                .get("/v1/feeds/counters")
                .then((r) => {
                    _each(r.data.reads, (v: number, k: number) => {
                        this._feeds[k].read = v;
                    });
                    _each(r.data.unreads, (v: number, k: number) => {
                        this._feeds[k].unread = v;
                    });
                })
                .catch((e) => root.showError(e));

            cats.resetCounters();
        },
    },
});
