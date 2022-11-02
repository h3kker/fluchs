<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useEntriesStore } from "../stores/entries";
import type { Entry } from '../stores/entries';
import ShowEntry from './Entry.vue';
import { SnackbarProgrammatic as Snackbar } from 'buefy'


const emit = defineEmits(['refresh'])
const entriesStore = useEntriesStore();
const { markAsRead } = entriesStore;
const { entries, total, filter } = storeToRefs(entriesStore);


function onPage(scrollTop=false) {
  filter.value.offset = (currentPage.value - 1)*filter.value.limit;
  emit('refresh');
  if (scrollTop) {
    document.getElementById("top")?.scrollIntoView({ behavior: 'smooth' });
  }
}
function calcPage(filter: { offset: number, limit: number }): number {
  return filter && filter.offset && filter.limit ? 
    Math.floor(filter.offset/filter.limit)+1 : 1;
}
const isOpen = ref<number | undefined>(undefined);
function openEntry(entry: Entry) {
  if (isOpen.value === entry.id) {
    isOpen.value = undefined;
  }
  else {
    isOpen.value = entry.id;
    markAsRead(entry);
  }
}
function markPageAsRead() {
  entriesStore.markEntriesAsRead(entries.value)
    .then(() => {
      const notification = Snackbar.open({
        duration: 15000,
        message: "Marked page as read",
        actionText: "Undo",
        pauseOnHover: true,
        cancelText: "Whatever.",
        position: 'is-bottom',
        type: 'is-warning',
        onAction: () => {
          entriesStore.undoMarkEntries();
          notification.close();
        },
      });
    });
}

const currentPage = ref(calcPage(filter.value));

</script>
<template>
    <div>
      <div class="columns">
        <div class="column">
          <div class="buttons has-addons">
            <b-button @click="$emit('refresh', true)">
              <b-icon icon="refresh"></b-icon>
            </b-button>
            <b-button @click="markPageAsRead()" disabled="entries.length === 0">
              <b-icon icon="check"></b-icon>
            </b-button>
            <b-button disabled>
              <b-icon icon="check-all"></b-icon>
            </b-button>

          </div>
        </div>
        <div class="column">
          <b-pagination
            @change="onPage(false)"
            :total="total"
            v-model="currentPage"
            :per-page="filter.limit"></b-pagination>
        </div>
      </div>

      <div v-for="entry in entries" :key="entry.id">
        <ShowEntry :entry="entry" :is-open="isOpen" @open-entry="openEntry(entry)"></ShowEntry>
      </div>
      <b-message v-if="entries.length === 0"
        title="Nothing to see here."
        has-icon
        type="is-info">
          Those lazy people did not write anything new. 
      </b-message>
      <b-pagination
        @change="onPage(true)"
        :total="total"
        v-model="currentPage"
        :per-page="filter.limit"></b-pagination>
    </div>

    
</template>