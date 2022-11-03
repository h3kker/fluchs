import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "@/views/HomeView.vue";
import CategoryView from "@/views/CategoryView.vue";
import CategoryEntriesView from "@/views/CategoryEntriesView.vue";
import AllEntriesView from "@/views/AllEntriesView.vue";
import StarredEntriesView from "@/views/StarredEntries.vue";

import { pinia } from "../main";
import { useFeedsStore } from "../stores/feeds";

Vue.use(VueRouter);

const router = new VueRouter({
    mode: "history",
    base: import.meta.env.BASE_URL,
    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView,
        },
        {
            path: "/cat/:id",
            name: "cat",
            component: CategoryView,
        },
        {
            path: "/cat/:catId/feeds/:id/entries",
            name: "cat-feed-entries",
            component: CategoryEntriesView,
        },
        {
            path: "/cat/:catId/entries",
            name: "cat-entries",
            component: CategoryEntriesView,
        },
        {
            path: "/entries",
            name: "all-entries",
            component: AllEntriesView,
        },
        {
            path: "/starred",
            name: "starred-entries",
            component: StarredEntriesView,
        },
    ],
});
router.beforeEach((to, from, next) => {
    if (to.path === "/") {
        next();
    } else {
        const feeds = useFeedsStore(pinia);
        feeds.state.subscribe((v) => {
            if (v === "ready") {
                next();
            }
        });
    }
});

export default router;
