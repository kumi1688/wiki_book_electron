
<template>
  <v-container>
    <v-navigation-drawer :value="drawer" :clipped="$vuetify.breakpoint.lgAndUp" app width="350">
      <v-list dense>
        <template v-for="(item,index) in items">
          <v-list-group
            v-if="item.children"
            :key="item.name"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title class="pt-2 pb-2">
                  <h2>{{index}}장 {{ item.name }}</h2>
                </v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item v-for="(child, i) in item.children" :key="i" link :to="child.to">
              <!-- <v-list-item-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-action>-->
              <v-list-item-action>
                <h3>{{index}}-{{i}}</h3>
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title>
                  <h3>{{ child.name }}</h3>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item v-else :key="item.name" link :to="item.to">
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="pt-2 pb-2">
                <h2>{{index}}장 {{ item.name }}</h2>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
  </v-container>
</template>

<script>
export default {
  computed: {
    drawer() {
      return this.$store.state.drawer;
    }
  },
  created: function() {
    let items = [];
    const bookName = this.$store.state.book.name;
    const bookIndexList = this.$store.state.book.indexList;
    items = bookIndexList.map(bookIndex => {
      return {
        icon: "mdi-chevron-up",
        model: false,
        "icon-alt": "mdi-chevron-down",
        name: bookIndex.name,
        children: bookIndex.subIndex
          ? bookIndex.subIndex.map((subIndex, i) => {
              return {
                name: subIndex.name,
                icon: "mdi-view-dashboard",
                to: `/book/${bookName}-${bookIndex.name}-${subIndex.name}`
              };
            })
          : null
      };
    });
    this.items = items;
  },
  data: function() {
    return {
      items: [
        // {
        //   icon: "mdi-chevron-up",
        //   "icon-alt": "mdi-chevron-down",
        //   name: "MQTT 소개",
        //   model: false,
        //   children: [
        //     { icon: "mdi-view-dashboard", name: "mqtt 소개", to: "/book1" },
        //     { icon: "mdi-view-dashboard", name: "mqtt 실습", to: "/book2" }
        //   ]
        // }
      ]
    };
  }
};
</script>