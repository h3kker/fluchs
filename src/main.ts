import Vue from "vue";
import { createPinia, PiniaVuePlugin } from "pinia";

import Buefy from "buefy";
import "buefy/dist/buefy.css";
import "@mdi/font/css/materialdesignicons.css";

import App from "./App.vue";
import router from "./router";

import { pluralize, prettyDateTime, dateAgo } from "./util/pretty";

Vue.use(PiniaVuePlugin);
Vue.use(Buefy);
Vue.filter("pluralize", pluralize);
Vue.filter("prettyDateTime", prettyDateTime);
Vue.filter("dateAgo", dateAgo);

export const pinia = createPinia();

new Vue({
    pinia,
    router,
    render: (h) => h(App),
}).$mount("#app");
