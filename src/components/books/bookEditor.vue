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
        <v-row justify="start" align="center">
          <v-img v-if="content.type === 'img'" :src="content.value" />
          <p
            v-if="content.type==='text'"
            :style="{'fontSize': '25px', 'width': '85%'}"
          >{{content.value}}</p>
          <editor
            v-if="content.type === 'code'"
            :value="content.value"
            @init="editorInit"
            :lang="content.lang"
            theme="chrome"
            width="1300"
            height="350"
          />
          <v-col>
            <v-select label="언어 타입 선택" :items="langs" v-model="content.lang" />
            <v-btn class="ml-10" color="orange" large @click="removeImage(index)">삭제하기</v-btn>
          </v-col>
        </v-row>
      </v-container>

      <!-- <v-container v-for="(code, index) in editorData.code" :key="index +'B'">
        <editor
          :value="code.value"
          @init="editorInit"
          :lang="code.lang"
          theme="chrome"
          width="1300"
          height="350"
        />
      </v-container>-->
    </v-container>

    <v-container v-if="isContentAdd && editorData.editorType==='newIndex'">
      <v-text-field
        class="mt-5 mb-5 pt-5 pb-5"
        label="새 목차의 제목을 입력해 주세요 (제목 완성 시 오른쪽 더하기 버튼 또는 엔터키 누르기)"
        single-line
        persistent-hint
        hint="새 목차의 제목을 입력해 주세요 (제목 완성 시 오른쪽 더하기 버튼 또는 엔터키 누르기)"
        v-model="editorData.title"
        append-outer-icon="mdi-plus"
        @click:append-outer="editorInput('newIndex')"
        @keyup.enter="editorInput('newIndex')"
      />
    </v-container>

    <v-container v-if="isContentAdd && isTitleAdded">
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
        <h2 v-if="!editorData.editorType" class="mt-4">새로 입력할 항목의 종류를 선택해주세요</h2>
        <v-container v-else-if="editorData.editorType==='text'">
          <v-textarea
            outlined
            class="mt-4"
            v-model="editorData.text"
            :style="{'fontSize': '25px'}"
          />
          <v-btn color="info" large @click="editorInput('text')">텍스트 작성 완료하기</v-btn>
        </v-container>
        <drop v-else-if="editorData.editorType==='img'" class="drop" @drop="handleDrop">
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

        <pre v-else-if="editorData.editorType==='terminal'"><kbd>$ 입력하기</kbd></pre>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import picture from "../../../public/images.png";
import fs from "fs";

export default {
  methods: {
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
    editorInput: function(type) {
      if (type === "newIndex") {
        this.isTitleAdded = true;
        this.editorData.editorType = null;
      } else if (type === "text") {
        this.editorContents.push({
          type: "text",
          value: this.editorData.text
        });
        this.editorData.text = null;
      }
    },
    setImage(e) {
      this.editorContents.push({
        type: "img",
        value: e.target.result
      });
    },
    removeImage(index) {
      this.editorContents = [
        ...this.editorContents.slice(0, index),
        ...this.editorContents.slice(index + 1)
      ];
    },
    setCodeDataManually() {
      this.editorContents.push({
        type: "code",
        lang: "javascript",
        value: ""
      });
    },
    setCodeData(e) {
      let extension = this.editorData.fileName.split(".");
      extension = extension[extension.length - 1];

      this.editorContents.push({
        type: "code",
        lang: extension,
        value: e.target.result
      });
    },
    readFile(file) {
      // `file.name` 형태의 확장자 규칙에 주의하세요
      if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
        const reader = new FileReader();

        this.editorData.fileName = file.name;
        reader.onload = this.setImage;
        reader.readAsDataURL(file);
      } else if (/\.(py|js|json|txt|c|cpp)$/i.test(file.name)) {
        const reader = new FileReader();

        this.editorData.fileName = file.name;
        reader.onload = this.setCodeData;
        reader.readAsText(file);
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
        { label: "터미널", value: "terminal" }
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
  width: 100%;
  background-color: #cfd8dc;
  border: solid #cfd8dc;
}

kbd {
  color: black;
  background-color: white;
  font-size: 20px;
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