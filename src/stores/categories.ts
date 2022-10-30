import { defineStore } from "pinia";

import { useRootStore } from "./root";

interface Category {
    title: string;
    user_id: number;
    id: number;
    hide_globally: boolean;
}

export const useCategoriesStore = defineStore({
    id: "categories",
    state: () => ({
        categories: [] as Category[],
    }),
    actions: {
        async getCategories() {
            const root = useRootStore();
            await root.backend
                .get("/v1/categories")
                .then((r) => (this.categories = r.data))
                .catch((e) => console.error(e));
        },
    },
});
