<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useEntriesStore } from "../stores/entries";
import type { Entry } from "../stores/entries";
import ShowEntry from "./ShowEntry.vue";
import { SnackbarProgrammatic as Snackbar } from "buefy";

const emit = defineEmits(["refresh"]);
const entriesStore = useEntriesStore();
const { markAsRead } = entriesStore;
const { entries, total, filter } = storeToRefs(entriesStore);

const curState = ref("init");
entriesStore.state.subscribe((v) => {
  curState.value = v;
});
const isLoading = computed(() => curState.value === 'loading');

function _refresh(force: boolean) {
  emit("refresh", force);
}
function nextPage() {
  filter.value.offset = (filter.value.offset || 0) + (filter.value.limit || 0);
  _refresh(false);
}
function prevPage() {
  filter.value.offset = Math.max(0, (filter.value.offset || 0) - (filter.value.limit || 0));
  _refresh(false);
}

const isOpen = ref<number | undefined>(undefined);
function openEntry(entry: Entry) {
  if (isOpen.value === entry.id) {
    isOpen.value = undefined;
  } else {
    isOpen.value = entry.id;
    markAsRead(entry);
  }
}
function markPageAsRead() {
  entriesStore.markEntriesAsRead(entries.value).then(() => {
    const notification = Snackbar.open({
      duration: 15000,
      message: "Marked page as read",
      actionText: "Undo",
      pauseOnHover: true,
      cancelText: "Whatever.",
      position: "is-bottom",
      type: "is-warning",
      onAction: () => {
        entriesStore.undoMarkEntries();
        notification.close();
      },
    });
    _refresh(true);
  });
}

const canNext = computed(() => (filter.value.offset + filter.value.limit) < total.value);
const canPrev = computed(() => filter.value.offset > 0);

</script>
<template>
  <div>
    <b-loading v-model="isLoading"></b-loading>
    <div class="columns">
      <div class="column">
        <div class="buttons has-addons">
          <b-button @click="$emit('refresh', true)">
            <b-icon icon="refresh"></b-icon>
          </b-button>
          <b-button @click="markPageAsRead()" :disabled="entries.length === 0">
            <b-icon icon="check"></b-icon>
          </b-button>
        </div>
      </div>
      <div class="column">
        <b-field grouped>
          <b-select placeholder="Sort order" v-model="filter.direction" @input="$emit('refresh')">
            <option value="asc">Oldest first</option>
            <option value="desc">Newest first</option>
          </b-select>
          <b-switch v-model="filter.status" true-value="read" false-value="unread" @input="$emit('refresh')">Show All</b-switch>
        </b-field>
      </div>
      <div class="column">
        <div class="buttons is-pulled-right has-addons">
          <b-button @click="prevPage()" v-if="canPrev">
            <b-icon icon="skip-previous"></b-icon>
          </b-button>
          <b-button @click="nextPage()" v-if="canNext">
            <b-icon icon="skip-next"></b-icon>
          </b-button>
        </div>
      </div>
    </div>

    <div v-for="entry in entries" :key="entry.id">
      <ShowEntry
        :entry="entry"
        :is-open="isOpen"
        @open-entry="openEntry(entry)"
      ></ShowEntry>
    </div>
    <b-message
      v-if="curState === 'ready' && entries.length === 0"
      title="Nothing to see here."
      has-icon
      type="is-info"
    >
      Those lazy people did not write anything new.
    </b-message>
    <div class="columns" v-else>
      <div class="column">
        <b-button @click="markPageAsRead()">
          <b-icon icon="check"></b-icon>
        </b-button>
      </div>
      <div class="column">
        <div class="buttons is-pulled-right has-addons">
          <b-button @click="prevPage()" v-if="canPrev">
            <b-icon icon="skip-previous"></b-icon>
          </b-button>
          <b-button @click="nextPage()" v-if="canNext">
            <b-icon icon="skip-next"></b-icon>
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>
