<script setup lang="ts">
import { useEntriesStore } from '../stores/entries';
import type { Entry } from '../stores/entries';
import { useCategoriesStore } from '../stores/categories';
import { useFeedsStore } from '../stores/feeds';
import { useRoute } from 'vue-router/composables';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

const feedsStore = useFeedsStore();
const entriesStore = useEntriesStore();
const categoriesStore = useCategoriesStore();
const route = useRoute();

const feed = feedsStore.getFeedById(parseInt(route.params.id));
const cat = categoriesStore.getCategoryById(parseInt(route.params.catId));


const { entries, total, filter } = storeToRefs(entriesStore);
const { toggleStar, markAsRead, markAsUnread } = entriesStore;
const currentPage = ref(calcPage(filter.value));

const isLoading = ref(false);
const curState = ref("init");
entriesStore.state.subscribe(
  v => {
    isLoading.value = v === 'loading';
    curState.value = v;
  }
);

const isOpen = ref<number | undefined>(undefined);

function refresh() {
  entriesStore.getEntries(parseInt(route.params.id));
}
function openEntry(entry: Entry) {
  if (isOpen.value === entry.id) {
    isOpen.value = undefined;
  }
  else {
    isOpen.value = entry.id;
    markAsRead(entry);
  }
}
function openExternal(entry: Entry) {
  window.open(entry.url, '_blank');
  markAsRead(entry);
}
function openComments(entry: Entry) {
  window.open(entry.comments_url, '_blank');
}
function onPage(scrollTop=false) {
  filter.value.offset = (currentPage.value - 1)*filter.value.limit;
  entriesStore.getEntries(parseInt(route.params.id));
  if (scrollTop) {
    document.getElementById("top")?.scrollIntoView({ behavior: 'smooth' });
  }
}

function calcPage(filter: { offset: number, limit: number }): number {
  return Math.floor(filter.offset/filter.limit)+1;
}

refresh();

</script>
<template>
  <div class="container" v-if="cat">
    <div class="mb-4">
      <b-breadcrumb size="is-large">
        <b-breadcrumb-item 
            tag="router-link" 
            :to="{ name: 'home' }">
            All
        </b-breadcrumb-item>
        <b-breadcrumb-item 
            tag="router-link" 
            :to="{ name: 'cat', params: { id: cat.id } }">
            {{ cat.title }}
        </b-breadcrumb-item>
        <b-breadcrumb-item active>
            {{ feed.title }}
        </b-breadcrumb-item>
      </b-breadcrumb>
    </div>
    <div id="top" class="block" v-if="curState == 'ready'">
      <div class="columns">
        <div class="column">
          <div class="buttons has-addons">
            <b-button @click="refresh()">
              <b-icon icon="refresh"></b-icon>
            </b-button>
            <b-button disabled>
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

      <div class="card mb-2" v-for="entry in entries" :key="entry.id">
          <header class="card-header" @click="openEntry(entry)">
            <div class="card-header-title level">
              <div class="level-left">
                <div class="level-item">{{ entry.title }}</div>
              </div>
              <div class="level-right">
                <div class="level-item is-size-7">
                  {{ entry.author }} | {{ entry.published_at | dateAgo() }}
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
              <a @click="entry.status == 'read' ? markAsUnread(entry) : markAsRead(entry)">
                <b-icon :icon="entry.status == 'read' ? 'email-outline' : 'check'"></b-icon>
              </a>
            </div>
            <div class="card-footer-item">
              <a @click="openExternal(entry)">
                <b-icon icon="open-in-new"></b-icon>
              </a>
            </div>
            <div class="card-footer-item">
              <a @click="openComments(entry)" v-if="entry.comments_url">
                <b-icon icon="comment-multiple-outline"></b-icon>
              </a>
              <b-icon v-else icon="comment-multiple-outline"></b-icon>
            </div>
          </footer>
      </div>
      <b-pagination
        @change="onPage(true)"
        :total="total"
        v-model="currentPage"
        :per-page="filter.limit"></b-pagination>
    </div>
    <b-loading v-model="isLoading"></b-loading>
  </div>
</template>