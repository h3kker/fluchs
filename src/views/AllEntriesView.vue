<script setup lang="ts">
import { useEntriesStore } from "../stores/entries";
import EntryList from "../components/EntryList.vue";
import { ref, onUnmounted } from "vue";
import { useRoute, onBeforeRouteUpdate } from "vue-router/composables";
import { storeToRefs } from "pinia";
import { isArray } from "lodash";

const route = useRoute();

const entriesStore = useEntriesStore();
const { filter } = storeToRefs(entriesStore);

onUnmounted(() => {
  delete filter.value.search;
});
onBeforeRouteUpdate((to, from, next) => {
  setSearch(to.query.q);
  next();
});
setSearch(route.query.q);

function setSearch(q: string | (string | null)[]) {
  if (q) {
    filter.value.search = isArray(q) ? q[0] || undefined : q;
    refresh();
  }
  else {
    delete filter.value.search;
    refresh();
  }
}

function refresh(force = false) {
  entriesStore.getAllEntries(force);
}
const isLoading = ref(false);
const curState = ref("init");

entriesStore.state.subscribe((v) => {
  isLoading.value = v === "loading";
  curState.value = v;
});
</script>
<template>
  <div class="container">
    <div class="mb-4">
      <b-breadcrumb size="is-large">
        <b-breadcrumb-item tag="router-link" :to="{ name: 'home' }">
          Categories
        </b-breadcrumb-item>
        <b-breadcrumb-item active> All </b-breadcrumb-item>
      </b-breadcrumb>
    </div>
    <div id="top" class="block" v-if="curState == 'ready'">
      <EntryList @refresh="(force) => refresh(force)" />
    </div>
    <b-loading v-model="isLoading"></b-loading>
  </div>
</template>
