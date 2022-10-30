<script setup lang="ts">
import { useCategoriesStore } from "../stores/categories";
import { storeToRefs } from "pinia";

const { categories } = storeToRefs(useCategoriesStore());
const { getCategories } = useCategoriesStore();

getCategories();
</script>

<template>
  <div class="container">
    <h1>Oink!</h1>
    <div class="columns is-multiline">
      <div class="column is-one-third" v-for="cat in categories" :key="cat.id">
        <div class="card">
          <div class="card-content">
            <p class="title">{{ cat.title }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
