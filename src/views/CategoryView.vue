<script setup lang="ts">
import { useCategoriesStore } from "../stores/categories";
import { useRoute } from "vue-router/composables";
import { computed } from "vue";
import { orderBy as _orderBy, each as _each } from "lodash";
import { useFeedsStore } from "../stores/feeds";
import type { Feed } from "../stores/feeds";
import FeedIcon from '../components/FeedIcon.vue';
import { ToastProgrammatic as Toast } from "buefy";
import { DialogProgrammatic as Dialog } from 'buefy'

const categoriesStore = useCategoriesStore();
const feedsStore = useFeedsStore();
const route = useRoute();

const cat = categoriesStore.getCategoryById(parseInt(route.params.id));

const sortedFeeds = computed(() => {
  return _orderBy(cat?.feeds, "unread", "desc");
});
function refreshFeed(feed: Feed) {
  feedsStore.refresh(feed).then((feed) => {
    if (feed.parsing_error_count === 0) {
      Toast.open({
        message: "Feed refreshed",
        type: "is-success",
        position: "is-bottom",
      });
    } else {
      Toast.open({
        message: `Feed still bad: ${feed.parsing_error_message}`,
        type: "is-warning",
        position: "is-bottom",
        duration: 15000,
        pauseOnHover: true,
      });
    }
  });
}
function reload() {
  feedsStore.getFeedCounters();
}
function markFeedAsRead(feed: Feed) {
  Dialog.confirm({
    title: "Mark all articles as read",
    message: "Are you sure there's nothing interesting left?",
    confirmText: "Pah",
    type: "is-warning",
    hasIcon: true,
    onConfirm: () => feedsStore.markAsRead(feed),
  });
}
</script>
<template>
  <div class="container" v-if="cat">
    <div class="mb-4">
      <b-breadcrumb size="is-large">
        <b-breadcrumb-item tag="router-link" :to="{ name: 'home' }">
          Categories
        </b-breadcrumb-item>
        <b-breadcrumb-item active>{{ cat.title }}</b-breadcrumb-item>
      </b-breadcrumb>
    </div>
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
          <router-link :to="{ name: 'cat-entries', params: { catId: cat.id } }">
            <header class="card-header">
              <div class="card-header-title is-justify-content-space-between">
                  <div>
                    All
                  </div>
                  <div>
                    <b-tag :type="cat.total_unread > 0 ? 'is-primary' : ''">{{
                      cat.total_unread
                    }}</b-tag>
                  </div>
              </div>
            </header>
          </router-link>
          <div class="card-content">
            <div class="content">
              <p>{{ cat.unread_feeds }} unread feeds</p>
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
        v-for="feed in sortedFeeds"
        :key="feed.id"
      >
        <div class="card">
          <router-link
            :to="{
              name: 'cat-feed-entries',
              params: { catId: cat.id, id: feed.id },
            }">
            <header class="card-header" :class=" feed.parsing_error_count > 0 ? 'has-background-warning-light' : '' ">
              <div class="card-header-title is-justify-content-space-between">
                  <div>
                    <b-tooltip
                      v-if="feed.parsing_error_count > 0"
                      :label="feed.parsing_error_message"
                      multilined
                      type="is-warning">
                      <b-icon icon="alert-circle-outline"></b-icon>
                    </b-tooltip>
                    <FeedIcon :feed="feed"/>
                    {{ feed.title }}
                  </div>
                  <div>
                    <b-tag :type="feed.unread > 0 ? 'is-primary' : ''">
                      {{ feed.unread }}
                    </b-tag>
                  </div>
              </div>
            </header>
          </router-link>
          <div class="card-content">
            <div class="content">
              <p>last checked {{ feed.checked_at | dateAgo() }}</p>
            </div>
          </div>
          <footer class="card-footer">
            <div class="card-footer-item">
              <a @click="markFeedAsRead(feed)">
                <b-icon icon="check-all"></b-icon>
              </a>
            </div>
            <div class="card-footer-item">
              <a @click="refreshFeed(feed)">
                <b-icon icon="sync"></b-icon>
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </div>
  <div class="container" v-else>
    <b-message type="is-danger" has-icon title="Invalid category">
      Something went wrong.
    </b-message>
  </div>
</template>