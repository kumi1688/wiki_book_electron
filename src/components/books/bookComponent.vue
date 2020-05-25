<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="11" class="indexWrapper">
        <h1>목차</h1>
        <ol v-for="(item, index) in items" :key="index + 'A'">
          <h2>
            {{index}}.
            {{item.title}}
          </h2>
        </ol>
      </v-col>
      <v-col cols="12" md="11" v-for="(item,index) in items" :key="index + 'B'">
        <h1>{{item.title}}</h1>
        <hr />

        <v-container v-for="(content, index) in item.contents" :key="index + 'C'">
          <pre v-if="content.type === 'terminal'"><kbd>$ {{content.value}}</kbd></pre>
          <editor
            v-if="content.type ==='code'"
            :value="readCode(content.value)"
            @init="editorInit"
            :lang="getLanguage(content)"
            :theme="theme"
            width="1300"
            height="350"
          />
          <!-- <h2 v-if="content.type ==='code'">{{readCode(content.value).length}}</h2> -->
          <v-img v-if="content.type === 'img'" :src="getImage(content.value)" />
          <p v-if="content.type ==='text'">{{content.value}}</p>
          <v-text-field
            v-if="content.type ==='file'"
            solo
            label="Prepend"
            prepend-icon="mdi-paperclip"
            :value="content.fileName"
            @click="downloadFile(content)"
          />
        </v-container>
      </v-col>
      <v-col cols="12" md="11">
        <book-editor @addNewBookContent="addNewBookContent" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import fs, { readFileSync } from "fs";
import path from "path";
import bookEditor from "./bookEditor";

export default {
  components: {
    editor: require("vue2-ace-editor"),
    "book-editor": bookEditor
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
    getLanguage: function(content) {
      // ["javascript", "java", "c_cpp", "python", "html", "json"],
      // } else if (/\.(py|js|json|txt|c|cpp)$/i.test(file.name)) {
      switch (content.lang) {
        case "py":
          return "python";
        case "c":
        case "cpp":
          return "c_cpp";
        case "js":
          return "javascript";
        case "json":
          return "json";
        case "txt":
          return "txt";
        case "html":
          return "html";
      }
    },
    getUrl: function() {
      const routerPath = this.$route.params.data.split("/")[0].split("-");
      const result = path.join(
        __static,
        `/books/${routerPath[0]}/${routerPath[1]}/${routerPath[2]}`
      );

      return result;
    },
    downloadFile: function(content) {
      // let fileURL = window.URL.createObjectURL(new Blob([response.data]));
      // console.log(content);
      const result = fs.readFileSync(`${this.getUrl()}/${content.value}`);
      let fileURL = window.URL.createObjectURL(new Blob([result]));
      let fileLink = document.createElement("a");

      fileLink.href = fileURL;
      fileLink.setAttribute("download", content.fileName);
      document.body.appendChild(fileLink);

      fileLink.click();
    },
    getData: function() {
      const url = this.getUrl();
      if (fs.readdirSync(url).includes("index.json")) {
        console.log("열기");
        const result = fs.readFileSync(`${url}/index.json`);
        this.items = JSON.parse(result);
      } else {
        console.log("추가");
        const data = [
          {
            title: "내용을 추가해주세요",
            contents: []
          }
        ];
        fs.writeFileSync(`${url}/index.json`, JSON.stringify(data));
        this.items = data;
      }
    },
    addNewBookContent: function(payload) {
      payload.contents = payload.contents.map(content => {
        if (content.rawData) delete content.rawData;
        return content;
      });
      if (this.items.find(item => item.title === "내용을 추가해주세요")) {
        this.items = [];
      }
      this.items = [...this.items, payload];

      this.saveBook();
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
      // const routerPath = this.$route.params.data.split("/")[0].split("-");
      // const data = fs.readFileSync(
      //   path.join(
      //     __static,
      //     `/books/${routerPath[0]}/${routerPath[1]}/${routerPath[2]}/${codeName}`
      //   )
      // );
      const url = this.getUrl();
      const data = fs.readFileSync(`${url}/${codeName}`);
      return data.toString();
    },
    saveBook: function() {
      // const routerPath = this.$route.params.data.split("/")[0].split("-");
      // fs.writeFileSync(
      //   path.join(
      //     __static,
      //     `/books/${routerPath[0]}/${routerPath[1]}/${routerPath[2]}/index.json`
      //   ),
      //   JSON.stringify(this.items)
      // );
      const url = this.getUrl();
      fs.writeFileSync(`${url}/index.json`, JSON.stringify(this.items));
      fs.preventDefault();
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