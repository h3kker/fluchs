<script setup lang="ts">
import { useEntriesStore } from '../stores/entries';
import { useCategoriesStore } from '../stores/categories';
import { useFeedsStore } from '../stores/feeds';
import { useRoute } from 'vue-router/composables';
import { ref } from 'vue';
import EntryList from '../components/EntryList.vue';

const feedsStore = useFeedsStore();
const categoriesStore = useCategoriesStore();
const entriesStore = useEntriesStore();
const route = useRoute();

const feed = feedsStore.getFeedById(parseInt(route.params.id));
const cat = categoriesStore.getCategoryById(parseInt(route.params.catId));

function refresh(force=false) {
  if (feed) {
    entriesStore.getFeedEntries(feed.id, force);
  }
  else if (cat) {
    entriesStore.getCategoryEntries(cat.id, force);
  }
}

const isLoading = ref(false);
const curState = ref("init");
entriesStore.state.subscribe(
  v => {
    isLoading.value = v === 'loading';
    curState.value = v;
  }
);

refresh();

</script>
<template>
  <div class="container" v-if="cat">
    <div class="mb-4">
      <b-breadcrumb size="is-large">
        <b-breadcrumb-item 
            tag="router-link" 
            :to="{ name: 'home' }">
            Categories
        </b-breadcrumb-item>
        <b-breadcrumb-item 
            tag="router-link" 
            :to="{ name: 'cat', params: { id: cat.id } }">
            {{ cat.title }}
        </b-breadcrumb-item>
        <b-breadcrumb-item active v-if="feed">
            {{ feed.title }}
        </b-breadcrumb-item>
        <b-breadcrumb-item active v-else>
            All
        </b-breadcrumb-item>
      </b-breadcrumb>
    </div>
    <div id="top" class="block" v-if="curState == 'ready'">
      <EntryList @refresh="(force) => refresh(force)" />
    </div>
    <b-loading v-model="isLoading"></b-loading>
  </div>
</template>