<template>
  <v-container>
    <core-bar />
    <core-drawer v-if="drawer" />
    <v-content class="mx-auto">
      <router-view />
    </v-content>
  </v-container>
</template>

<script>
import drawer from "./core/drawer";
import bar from "./core/bar";

export default {
  components: {
    "core-drawer": drawer,
    "core-bar": bar
  },
  computed: {
    drawer: function() {
      return this.$store.state.drawer;
    }
  },
  data: function() {
    return {
      books: null
    };
  },
  methods: {}
};
</script>