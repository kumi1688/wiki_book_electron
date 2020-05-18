<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="11" class="indexWrapper">
        <h1>목차</h1>
        <ol v-for="(item, index) in items" :key="index">
          <h2>
            {{index}}.
            {{item.title}}
          </h2>
        </ol>
      </v-col>
      <v-col cols="12" md="11" v-for="(item,index) in items" :key="index">
        <h1>{{item.title}}</h1>
        <hr />
        <v-container v-if="item.contents">
          <v-container v-for="(content, i) in item.contents" :key="i">
            <pre v-if="content.terminal"><kbd>$ {{content.terminal}}</kbd></pre>
            <editor
              v-if="content.code"
              :value="readCode(content.code.name)"
              @init="editorInit"
              :lang="content.code.lang"
              :theme="theme"
              width="1300"
              height="350"
            />
            <h2 v-if="content.code">{{readCode(content.code.name).length}}</h2>
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
  components: {
    editor: require("vue2-ace-editor")
  },
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
      theme: "chrome",
      items: [
        {
          title: "현재 텍스트가 존재하지 않습니다",
          text: null
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
    },
    editorInit: function(editor) {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/less");
      require("brace/snippets/javascript"); //snippet
      require("brace/theme/chrome");
      editor.setOptions({
        fontSize: "20pt"
      });
    },
    readCode: function(codeName) {
      const routerPath = this.$route.params.data.split("/")[0].split("-");
      const data = fs.readFileSync(
        path.join(
          __static,
          `/books/${routerPath[0]}/${routerPath[1]}/${routerPath[2]}/${codeName}`
        )
      );
      return data.toString();
    }
  }
};
</script>

<style scoped>
p {
  font-size: 25px;
}

pre {
  width: 100%;
  background-color: #cfd8dc;
  border: solid #cfd8dc;
}

kbd {
  color: black;
  background-color: white;
  font-size: 20px;
}

.indexWrapper {
  border: black solid 2px;
}
</style>