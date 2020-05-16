<template>
  <v-container>
    <core-bar />
    <v-content class="mx-auto">
      <router-view />
    </v-content>
  </v-container>
</template>

<script>
// import drawer from "./core/drawer";
import bar from "./core/bar";

export default {
  components: {
    // "core-drawer": drawer,
    "core-bar": bar
  },

  data: function() {
    return {
      books: null
    };
  },
  methods: {}
};
</script>