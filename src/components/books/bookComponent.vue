<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="11" v-for="(item,index) in items" :key="index">
        <h2>{{item.title}}</h2>
        <hr />
        <v-container v-if="item.contents">
          <v-container v-for="(content, i) in item.contents" :key="i">
            <v-img v-for="(img, j) in content.img" :key="j" :src="getImage(img)" />
            <p v-for="(txt, k) in content.text" :key="k">{{txt}}</p>
          </v-container>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import fs, { readFileSync } from "fs";
import path from "path";

export default {
  watch: {
    $route: {
      immediate: true,
      handler: function(to, from) {
        this.data = this.$route.params.data;
        this.getData();
      }
    }
  },
  data: function() {
    return {
      data: null,
      items: [
        {
          title: "현재 텍스트가 존재하지 않습니다",
          text: "가을하늘"
        }
      ]
    };
  },
  methods: {
    getData: function() {
      const routerPath = this.$route.params.data.split("/")[0].split("-");
      const result = fs.readFileSync(
        path.join(
          __static,
          `/books/${routerPath[0]}/${routerPath[1]}/${routerPath[2]}/index.json`
        )
      );
      this.items = JSON.parse(result);
    },
    getImage: function(imgName) {
      const routerPath = this.$route.params.data.split("/")[0].split("-");
      return path.join(
        `/books/${routerPath[0]}/${routerPath[1]}/${routerPath[2]}/${imgName}`
      );
    }
  }
};
</script>

<style scoped>
p {
  font-size: 25px;
}
</style>