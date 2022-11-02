<script setup lang="ts">
import { useEntriesStore } from "../stores/entries";
import { Waypoint } from "vue-waypoint";
const props = defineProps(["entry", "isOpen"]);
defineEmits(["open-entry"]);

const entriesStore = useEntriesStore();

const { toggleStar, markAsRead, markAsUnread } = entriesStore;

function openExternal() {
  window.open(props.entry.url, "_blank");
  markAsRead(props.entry);
}
function openComments() {
  window.open(props.entry.comments_url, "_blank");
}
function visibilityChanged(state: any) {
  if (state.going === "OUT" && state.direction === "UP") {
    markAsRead(props.entry);
  }
}
</script>
<template>
  <Waypoint @change="visibilityChanged">
    <div class="card mb-2">
      <header class="card-header" @click="$emit('open-entry')">
        <div
          class="card-header-title level"
          :class="entry.status == 'read' ? 'has-text-grey-light' : ''"
        >
          <div class="level-left">
            <div class="level-item">{{ entry.title }}</div>
          </div>
          <div class="level-right">
            <div class="level-item is-size-7">
              {{ entry.author || "-" }} | {{ entry.published_at | dateAgo() }}
            </div>
          </div>
        </div>
      </header>
      <div class="card-content" v-if="isOpen == entry.id">
        <div class="content" v-html="entry.content"></div>
      </div>
      <footer class="card-footer">
        <div class="card-footer-item">
          <a @click="toggleStar(entry)">
            <b-icon :icon="entry.starred ? 'star' : 'star-outline'"></b-icon>
          </a>
        </div>
        <div class="card-footer-item">
          <a
            @click="
              entry.status == 'read' ? markAsUnread(entry) : markAsRead(entry)
            "
          >
            <b-icon
              :icon="entry.status == 'read' ? 'email-outline' : 'check'"
            ></b-icon>
          </a>
        </div>
        <div class="card-footer-item">
          <a @click="openExternal()">
            <b-icon icon="open-in-new"></b-icon>
          </a>
        </div>
        <div class="card-footer-item">
          <a @click="openComments()" v-if="entry.comments_url">
            <b-icon icon="comment-multiple-outline"></b-icon>
          </a>
          <b-icon v-else icon="comment-multiple-outline"></b-icon>
        </div>
      </footer>
    </div>
  </Waypoint>
</template>
