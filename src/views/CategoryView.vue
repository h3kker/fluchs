<script setup lang="ts">
import { useCategoriesStore } from "../stores/categories";
import { useRoute } from "vue-router/composables";
import { computed } from "vue";
import { orderBy as _orderBy } from "lodash";

const categoriesStore = useCategoriesStore();
const route = useRoute();

const cat = categoriesStore.getCategoryById(parseInt(route.params.id));

const sortedFeeds = computed(() => {
  if (cat === undefined) {
    return [];
  }
  return _orderBy(cat.feeds, "unread", "desc");
});
</script>
<template>
  <div class="container" v-if="cat">
    <div class="mb-4">
      <b-breadcrumb size="is-large">
        <b-breadcrumb-item tag="router-link" :to="{ name: 'home' }">All</b-breadcrumb-item>
        <b-breadcrumb-item active>{{ cat.title }}</b-breadcrumb-item>
      </b-breadcrumb>
    </div>
    <div class="columns is-multiline">
      <div class="column is-one-third" v-for="feed in sortedFeeds" :key="feed.id">
        <router-link :to="{ name: 'cat-entries', params: { catId: cat.id, id: feed.id } }">
          <div class="card">
            <header class="card-header">
              <div class="card-header-title level">
                <div class="level-left">
                  <div class="level-item">{{ feed.title }}</div>
                </div>
                <div class="level-right">
                  <div class="level-item">
                    <b-tag :type="feed.unread > 0 ? 'is-primary' : ''">{{ feed.unread }}</b-tag>
                  </div>
                </div>
              </div>
            </header>
            <div class="card-content">
              <div class="content">
                <p>
                  last modified {{ feed.last_modified_header | dateAgo() }}<br>
                  last checked {{ feed.checked_at | dateAgo() }}
                </p>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
  <div class="container" v-else>
    <b-message type="is-danger" has-icon title="Invalid category">
      Something went wrong.
    </b-message>
  </div>
</template>
<style></style>
