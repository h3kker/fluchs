import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "@/views/HomeView.vue";
import CategoryView from "@/views/CategoryView.vue";
import CategoryEntriesView from "@/views/CategoryEntriesView.vue";

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
            name: "cat-entries",
            component: CategoryEntriesView,
        },
    ],
});
router.beforeEach((to, from, next) => {
    const feeds = useFeedsStore(pinia);
    if (to.path === "/") {
        next();
    } else {
        console.log("waiting");
        feeds.state.subscribe((v) => {
            if (v === "ready") {
                console.log("done");
                next();
            }
        });
    }
});

export default router;
