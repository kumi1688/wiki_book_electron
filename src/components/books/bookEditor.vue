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
        <h2>{{editorData.title}}</h2>
      </v-container>

      <v-container v-for="(img, index) in editorData.img" :key="index">
        <v-row align="center">
          <v-btn class="mr-5" @click="removeImage(index)">이미지 제거</v-btn>
          <v-img :src="img" />
        </v-row>
      </v-container>

      <v-container v-for="(code, index) in editorData.code" :key="index">
        <editor
          :value="code.value"
          @init="editorInit"
          :lang="code.lang"
          theme="chrome"
          width="1300"
          height="350"
        />
      </v-container>
    </v-container>
    <v-container v-if="isContentAdd">
      <v-row justify="center">
        <v-checkbox
          class="mr-2"
          v-model="editorData.editorType"
          label="텍스트"
          color="indigo"
          value="text"
          hide-details
        ></v-checkbox>
        <v-checkbox
          class="mr-2"
          v-model="editorData.editorType"
          label="이미지"
          color="info"
          value="img"
          hide-details
        ></v-checkbox>
        <v-checkbox
          class="mr-2"
          v-model="editorData.editorType"
          label="코드"
          color="success"
          value="code"
          hide-details
        ></v-checkbox>
        <v-checkbox
          class="mr-2"
          v-model="editorData.editorType"
          label="터미널"
          color="orange"
          value="terminal"
          hide-details
        ></v-checkbox>
        <v-checkbox
          v-model="editorData.editorType"
          label="새로운 목차"
          color="green"
          value="newIndex"
          hide-details
        ></v-checkbox>
      </v-row>
      <v-row justify="center">
        <h2 v-if="!editorData.editorType" class="mt-4">새로 입력할 항목의 종류를 선택해주세요</h2>
        <v-textarea
          v-else-if="editorData.editorType==='text'"
          outlined
          class="mt-4"
          v-model="editorData.text"
          @keyup.enter="editorInput('text')"
        />
        <drop v-else-if="editorData.editorType==='img'" class="drop" @drop="handleDrop">
          <v-container>
            <h2>파일을 끌어와주세요</h2>
            <v-img :src="picture" />
          </v-container>
        </drop>

        <v-container v-else-if="editorData.editorType==='code'">
          <v-row justify="center" align="center">
            <v-btn class="ml-3 mr-3" @click="editorData.code.push('입력해주세요')">직접 입력</v-btn>
            <drop class="drop ml-3 mr-3" @drop="handleDrop">
              <v-container>
                <h2>파일을 끌어와주세요</h2>
              </v-container>
            </drop>
          </v-row>
        </v-container>

        <pre v-else-if="editorData.editorType==='terminal'"><kbd>$ 야호</kbd></pre>
        <v-text-field
          v-else-if="editorData.editorType==='newIndex'"
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
        editorType: null,
        title: null,
        text: null,
        img: [],
        terminal: null,
        code: []
      };
    },
    editorInput: function(type) {
      if (type === "newIndex") {
        this.editorData.editorType = null;
      }
    },
    setPreviewImage(e) {
      this.editorData.img = [...this.editorData.img, e.target.result];
    },
    setCodeData(e) {
      let extension = this.editorData.fileName.split(".");
      extension = extension[extension.length - 1];

      this.editorData.code = [
        ...this.editorData.code,
        {
          lang: extension,
          value: e.target.result
        }
      ];
    },
    readAndPreview(file) {
      // `file.name` 형태의 확장자 규칙에 주의하세요
      if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
        const reader = new FileReader();

        this.editorData.fileName = file.name;
        reader.onload = this.setPreviewImage;
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
        [].forEach.call(files, this.readAndPreview);
      } else {
        this.readAndPreview(files[0]);
      }
    },
    removeImage(index) {
      this.editorData.img = [
        ...this.editorData.img.slice(0, index),
        ...this.editorData.img.slice(index + 1)
      ];
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
    }
  },
  components: {
    editor: require("vue2-ace-editor")
  },
  data: function() {
    return {
      picture,
      content: null,
      draggable: "Drag Me",
      isContentAdd: false,
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