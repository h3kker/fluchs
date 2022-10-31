import Vue from "vue";
import { createPinia, PiniaVuePlugin } from "pinia";

import Buefy from "buefy";
import "buefy/dist/buefy.css";
import "@mdi/font/css/materialdesignicons.css";

import App from "./App.vue";
import router from "./router";

import { pluralize } from "./util/pretty";

Vue.use(PiniaVuePlugin);
Vue.use(Buefy);
Vue.filter("pluralize", pluralize);

export const pinia = createPinia();

new Vue({
    router,
    pinia,
    render: (h) => h(App),
}).$mount("#app");
