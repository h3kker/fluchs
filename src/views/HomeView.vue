<script setup lang="ts">
import { useCategoriesStore } from "../stores/categories";
import type { Category } from "../stores/categories";
import { useFeedsStore } from "../stores/feeds";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { filter as _filter } from "lodash";
import { DialogProgrammatic as Dialog } from 'buefy'

const categoriesStore = useCategoriesStore();
const feedsStore = useFeedsStore();

const { categories } = storeToRefs(categoriesStore);
const showCategories = computed(() => {
  return _filter(categories.value, (c) => c.feeds && c.feeds.length > 0);
});
const totals = computed(() => {
  const ret = {
    feeds: 0,
    unread_feeds: 0,
    unread_entries: 0,
  };
  categories.value.forEach((cat) => {
    ret.feeds += cat.feeds.length;
    ret.unread_feeds += cat.unread_feeds;
    ret.unread_entries += cat.total_unread;
  });
  return ret;
});
function reload() {
  feedsStore.getFeedCounters();
}
function markCategoryAsRead(cat: Category) {
  Dialog.confirm({
    title: "Mark all articles as read",
    message: "Are you sure there's nothing interesting left?",
    confirmText: "Pah",
    type: "is-warning",
    hasIcon: true,
    onConfirm: () => categoriesStore.markAsRead(cat),
  });
}
</script>

<template>
  <div class="container">
    <div class="columns">
      <div class="column">
        <div class="buttons has-addons">
          <b-button @click="reload()">
            <b-icon icon="refresh"></b-icon>
          </b-button>
        </div>
      </div>
    </div>
    <div class="columns is-multiline">
      <div class="column is-one-third">
        <div class="card">
          <router-link :to="{ name: 'all-entries' }">
            <header class="card-header">
              <div class="card-header-title is-justify-content-space-between">
                  <div>
                    All
                  </div>
                  <div>
                    <b-tag :type="totals.unread_feeds > 0 ? 'is-primary' : ''">
                      {{ totals.unread_feeds }}
                    </b-tag>
                  </div>
              </div>
            </header>
          </router-link>
          <div class="card-content">
            <div class="content">
              <p>
                {{ totals.unread_entries }} unread articles,
                {{ totals.feeds }} total feeds
              </p>
            </div>
          </div>
          <footer class="card-footer">
            <div class="card-footer-item">
              <a>
                <b-icon icon="check-all"></b-icon>
              </a>
            </div>
          </footer>
        </div>
      </div>
      <div
        class="column is-one-third"
        v-for="cat in showCategories"
        :key="cat.id"
      >
        <div class="card">
          <router-link :to="{ name: 'cat', params: { id: cat.id } }">
            <header class="card-header">
              <div class="card-header-title is-justify-content-space-between">
                  <div>
                    {{ cat.title }}
                  </div>
                  <div>
                    <b-tag :type="cat.unread_feeds > 0 ? 'is-primary' : ''">
                      {{ cat.unread_feeds }}
                    </b-tag>
                  </div>
              </div>
            </header>
          </router-link>
          <div class="card-content">
            <div class="content">
              <p>
                {{ cat.total_unread }} unread
                {{ cat.total_unread | pluralize("article") }},
                {{ cat.feeds.length }} total
                {{ cat.feeds.length | pluralize("feed") }}.
              </p>
            </div>
          </div>
          <footer class="card-footer">
            <div class="card-footer-item">
              <router-link
                :to="{ name: 'cat-entries', params: { catId: cat.id } }"
              >
                <b-icon icon="book-open-outline"></b-icon>
              </router-link>
            </div>
            <div class="card-footer-item">
              <a @click="markCategoryAsRead(cat)">
                <b-icon icon="check-all"></b-icon>
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>
