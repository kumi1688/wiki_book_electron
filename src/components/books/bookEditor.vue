<template>
  <v-container>
    <v-container>
      <v-row justify="center">
        <v-btn v-if="!this.isContentAdd" color="#CDDC39" @click="contentAdd(true)" x-large>
          <h2 class="display-1">항목 추가</h2>
        </v-btn>
        <v-btn v-else color="orange" @click="contentAdd(false)" x-large>
          <h2 class="display-1">항목 추가 중단</h2>
        </v-btn>
      </v-row>
    </v-container>
    <v-container v-if="isContentAdd">
      <v-container v-if="editorData.title">
        <h1>{{editorData.title}}</h1>
        <hr />
      </v-container>

      <v-container v-for="(content, index) in editorContents" :key="index+'A'">
        <v-row justify="center" align="center">
          <v-img v-if="content.type === 'img'" :src="content.rawData" />
          <p
            v-if="content.type==='text'"
            :style="{'fontSize': '25px', 'width': '85%'}"
          >{{content.value}}</p>
          <editor
            v-if="content.type === 'code'"
            :value="content.rawData"
            @init="editorInit"
            :lang="getLanguage(content)"
            theme="chrome"
            width="1300"
            height="350"
          />
          <pre v-if="content.type === 'terminal'"><kbd>$ {{content.value}}</kbd></pre>
          <v-list v-if="content.type === 'file'">
            <v-list-item>
              <v-list-item-title>{{content.fileName}}</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-col>
            <!-- <v-select
              v-if="content.type === 'code'"
              label="언어 타입 선택"
              :items="langs"
              v-model="content.lang"
            />-->
            <v-btn class="ml-10" color="orange" large @click="removeContent(index)">삭제하기</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

    <v-container v-if="isContentAdd && editorData.editorType==='newIndex'">
      <v-text-field
        class="mt-5 mb-5 pt-5 pb-5"
        label="새 목차의 제목을 입력해 주세요 (제목 완성 시 오른쪽 더하기 버튼 또는 엔터키 누르기)"
        single-line
        v-model="editorData.title"
        append-outer-icon="mdi-plus"
        @click:append-outer="editorInput('newIndex')"
        @keyup.enter="editorInput('newIndex')"
      />
    </v-container>

    <v-container v-if="isContentAdd && isTitleAdded">
      <h2 :style="{'textAlign':'center'}" class="mt-4">새로 입력할 항목의 종류를 선택해주세요</h2>
      <v-row justify="center">
        <v-checkbox
          v-for="(checkBox, index) in checkBoxes"
          :key="index + 'C'"
          class="mr-2"
          v-model="editorData.editorType"
          :label="checkBox.label"
          color="info"
          :value="checkBox.value"
          hide-details
        />
      </v-row>
      <v-row justify="center">
        <v-container v-if="!editorData.editorType">
          <v-row justify="center" align="center">
            <v-btn color="#CDDC39" @click="contentAddComplete" x-large>
              <h2 class="display-1">항목 추가 완료</h2>
            </v-btn>
          </v-row>
        </v-container>
        <v-container v-else-if="editorData.editorType==='text'">
          <v-textarea
            outlined
            class="mt-4"
            v-model="editorData.text"
            :style="{'fontSize': '25px'}"
          />
          <v-btn color="info" large @click="editorInput('text')">텍스트 작성 완료하기</v-btn>
        </v-container>
        <drop
          v-else-if="editorData.editorType==='img' || editorData.editorType==='file'"
          class="drop"
          @drop="handleDrop"
        >
          <v-container>
            <h2>파일을 끌어와주세요</h2>
            <v-img :src="picture" />
          </v-container>
        </drop>

        <v-container v-else-if="editorData.editorType==='code'">
          <v-row justify="center" align="center">
            <v-btn class="ml-3 mr-3" @click="setCodeDataManually">직접 입력</v-btn>
            <drop class="drop ml-3 mr-3" @drop="handleDrop">
              <v-container>
                <h2>파일을 끌어와주세요</h2>
              </v-container>
            </drop>
          </v-row>
        </v-container>

        <v-container v-else-if="editorData.editorType==='terminal'">
          <v-textarea
            class="mt-5"
            outlined
            v-model="editorData.terminal"
            :style="{'fontSize':'25px'}"
          >$ 입력하기</v-textarea>
          <v-btn color="info" large @click="editorInput('terminal')">터미널 작성 완료하기</v-btn>
        </v-container>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import picture from "../../../public/images.png";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export default {
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
    contentAdd: function(payload) {
      this.isContentAdd = payload;
      this.editorData = {
        editorType: "newIndex",
        title: null,
        text: null,
        img: [],
        terminal: null,
        code: []
      };
    },
    contentAddComplete: function() {
      this.$emit("addNewBookContent", {
        title: this.editorData.title,
        contents: this.editorContents
      });
      this.editorData = {
        type: null,
        title: null,
        text: null,
        img: [],
        terminal: null,
        code: null,
        fileName: ""
      };
      this.editorContents = [];
      this.isContentAdd = false;
    },
    editorInput: function(type) {
      if (type === "newIndex") {
        this.isTitleAdded = true;
      } else if (type === "text") {
        this.editorContents.push({
          type: "text",
          value: this.editorData.text
        });
        this.editorData.text = null;
      } else if (type === "terminal") {
        this.editorContents.push({
          type: "terminal",
          value: this.editorData.terminal
        });
        this.editorData.terminal = null;
      }
      this.editorData.editorType = null;
    },
    setImage(e, file) {
      // const prefix = 'data:image/png;base64,'
      // const extension = e.target.result.split(",")[0];
      const extension = this.getExtention(file.name);
      const data = e.target.result.split(",")[1];
      const url = this.getUrl();

      let buff = Buffer.from(data, "base64");
      const id = uuidv4();

      fs.writeFileSync(`${url}/${id}.${extension}`, buff);
      this.editorContents.push({
        type: "img",
        value: `${id}.${extension}`,
        rawData: e.target.result
      });
    },
    removeContent(index) {
      const fileName = this.editorContents[index].value;
      const contentType = this.editorContents[index].type;
      const url = this.getUrl();

      if (contentType !== "text" && contentType !== "terminal")
        fs.unlink(`${url}/${fileName}`, err => {
          if (err) alert("파일이 존재하지 않습니다");
        });
      this.editorContents = [
        ...this.editorContents.slice(0, index),
        ...this.editorContents.slice(index + 1)
      ];
    },
    getUrl: function() {
      const routerPath = this.$route.params.data.split("/")[0].split("-");
      const url = path.join(
        __static,
        `/books/${routerPath[0]}/${routerPath[1]}/${routerPath[2]}`
      );
      return url;
    },
    getExtention: function(fileName) {
      let extension;
      if (fileName) extension = fileName.split(".");
      else extension = this.editorData.fileName.split(".");

      extension = extension[extension.length - 1];
      return extension;
    },
    setCodeDataManually: function() {
      this.editorContents.push({
        type: "code",
        lang: "javascript",
        value: ""
      });
    },
    setCodeData(e, file) {
      const url = this.getUrl();
      const extension = this.getExtention(file.name);
      const id = uuidv4();

      fs.writeFileSync(`${url}/${id}.${extension}`, e.target.result);

      this.editorContents.push({
        type: "code",
        lang: extension,
        value: `${id}.${extension}`,
        rawData: e.target.result
      });
    },
    setFileData(e, file) {
      const extension = this.getExtention(file.name);
      const url = this.getUrl();
      const id = uuidv4();

      const data = e.target.result.split(",")[1];
      let buff = Buffer.from(data, "base64");
      fs.writeFileSync(`${url}/${id}.${extension}`, buff);

      this.editorContents.push({
        type: "file",
        value: `${id}.${extension}`,
        fileName: file.name
      });
    },
    readFile(file) {
      // `file.name` 형태의 확장자 규칙에 주의하세요
      if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
        const reader = new FileReader();

        this.editorData.fileName = file.name;
        reader.onload = (function(file, cb) {
          return function(e) {
            cb(e, file);
          };
        })(file, this.setImage);

        reader.readAsDataURL(file);
      } else if (/\.(py|js|json|txt|c|cpp|html)$/i.test(file.name)) {
        const reader = new FileReader();

        // this.editorData.fileName = file.name;
        reader.onload = (function(file, cb) {
          return function(e) {
            cb(e, file);
          };
        })(file, this.setCodeData);
        reader.readAsText(file);
      } else if (/\.(pdf|hwp|docx|doc|zip|egg)$/i.test(file.name)) {
        const reader = new FileReader();

        reader.onload = (function(file, cb) {
          return function(e) {
            cb(e, file);
          };
        })(file, this.setFileData);
        reader.readAsDataURL(file);
      } else alert("지원되지 않는 파일 형식입니다");
    },
    handleDrop(data, event) {
      const dt = event.dataTransfer;
      const files = dt.files;

      if (files.length > 1) {
        [].forEach.call(files, this.readFile);
      } else {
        this.readFile(files[0]);
      }
    },

    editorInit: function(editor) {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/c_cpp");
      require("brace/mode/java");
      require("brace/mode/json");
      require("brace/mode/python");
      require("brace/mode/less");

      require("brace/snippets/javascript"); //snippet
      require("brace/snippets/json");
      require("brace/snippets/c_cpp");
      require("brace/snippets/java");
      require("brace/snippets/python");
      require("brace/snippets/html");
      require("brace/theme/chrome");
      editor.setOptions({
        fontSize: "20pt"
      });
    }
  },
  components: {
    editor: require("vue2-ace-editor")
  },
  data: function() {
    return {
      picture,
      isTitleAdded: false,
      isContentAdd: false,
      checkBoxes: [
        { label: "텍스트", value: "text" },
        { label: "이미지", value: "img" },
        { label: "코드", value: "code" },
        { label: "터미널", value: "terminal" },
        { label: "파일", value: "file" }
      ],
      langs: ["javascript", "java", "c_cpp", "python", "html", "json"],
      editorContents: [],
      editorData: {
        type: null,
        title: null,
        text: null,
        img: [],
        terminal: null,
        code: null,
        fileName: ""
      }
    };
  }
};
</script>

<style scoped>
pre {
  width: 85%;
  background-color: #cfd8dc;
  border: solid #cfd8dc;
}

kbd {
  color: black;
  background-color: white;
  font-size: 25px;
}

.drag,
.drop {
  font-family: sans-serif;
  display: inline-block;
  border-radius: 5px;
  background: #ccc;
  position: relative;
  padding: 5px;
  margin-top: 20px;
  text-align: center;
  vertical-align: top;
}

.drag {
  color: #fff;
  cursor: move;
  background: #777;
  border-right: 2px solid #555;
  border-bottom: 2px solid #555;
}

.drop {
  background: #eee;
  border-top: 2px solid #ccc;
  border-left: 2px solid #ccc;
}
</style>