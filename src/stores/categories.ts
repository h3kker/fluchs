import { defineStore } from "pinia";
import { each as _each, map as _map } from "lodash";

import { useRootStore } from "./root";
import { useFeedsStore, type Feed } from "./feeds";

export interface Category {
    title: string;
    user_id: number;
    id: number;
    hide_globally: boolean;
    feeds: Feed[];
    unread_feeds: number;
    total_unread: number;
    total_read: number;
}

export function resetCatCounter(cat: Category) {
    cat.total_read = 0;
    cat.total_unread = 0;
    cat.unread_feeds = 0;
    _each(cat.feeds, (f) => {
        cat.total_read += f.read;
        cat.total_unread += f.unread;
        if (f.unread > 0) {
            cat.unread_feeds++;
        }
    });
}

export const useCategoriesStore = defineStore({
    id: "categories",
    state: () => ({
        categories: [] as Category[],
    }),
    getters: {
        getCategoryById: (state) => {
            return (id: number) => state.categories.find((cat) => cat.id === id);
        },
    },
    actions: {
        async getCategories(refresh = false): Promise<Category[]> {
            const root = useRootStore();
            if (!refresh && this.categories.length > 0) {
                return Promise.resolve(this.categories);
            }
            await root.backend
                .get("/v1/categories")
                .then((r) => {
                    this.categories = _map(r.data, (ncat) => {
                        ncat.total_read = 0;
                        ncat.total_unread = 0;
                        ncat.unread_feeds = 0;
                        ncat.feeds = [];
                        return ncat;
                    });
                })
                .catch((e) => root.showError(e));
            return this.categories;
        },
        resetCounters() {
            this.categories.forEach(resetCatCounter);
        },
        async markAsRead(cat: Category) {
            const root = useRootStore();
            const feeds = useFeedsStore();
            await root.backend
                .put(`/v1/categories/${cat.id}/mark-all-as-read`)
                .then(() => {
                    feeds.getFeedCounters();
                })
                .catch((e) => root.showError(e));
        }
    },
});
