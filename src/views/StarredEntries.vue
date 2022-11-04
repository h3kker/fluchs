<script setup lang="ts">
import { useEntriesStore } from "../stores/entries";
import EntryList from "../components/EntryList.vue";

const entriesStore = useEntriesStore();

entriesStore.filter.status = 'read';
entriesStore.filter.offset = 0;
function refresh(force = false) {
  entriesStore.getStarredEntries(force);
}
refresh();
</script>
<template>
  <div class="container">
    <div class="mb-4">
      <h2>Starred Entries</h2>
    </div>
    <div id="top" class="block">
      <EntryList @refresh="(force) => refresh(force)" />
    </div>
  </div>
</template>
