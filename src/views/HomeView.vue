<script setup lang="ts">
import { useCategoriesStore } from "../stores/categories";
import { storeToRefs } from "pinia";

const categoriesStore = useCategoriesStore();

const { categories } = storeToRefs(categoriesStore);
</script>

<template>
  <div class="container">
    <div class="columns is-multiline">
      <div class="column is-one-third" v-for="cat in categories" :key="cat.id">
        <router-link :to="{ name: 'cat', params: { id: cat.id } }">
          <div class="card">
            <header class="card-header">
              <div class="card-header-title level">
                <div class="level-left">
                  <div class="level-item">{{ cat.title }}</div>
                </div>
                <div class="level-right">
                  <div class="level-item">
                    <b-tag :type="cat.unread_feeds > 0 ? 'is-primary' : ''">{{
                      cat.unread_feeds
                    }}</b-tag>
                  </div>
                </div>
              </div>
            </header>
            <div class="card-content">
              <div class="content">
                <p>
                  {{ cat.total_unread }} unread
                  {{ cat.total_unread | pluralize("articles") }},
                  {{ cat.feeds.length }} total
                  {{ cat.feeds.length | pluralize("feed") }}.
                </p>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
