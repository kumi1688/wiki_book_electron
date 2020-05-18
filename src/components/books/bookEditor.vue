<template>
  <v-container>
    <v-container>
      <v-row justify="center">
        <v-btn v-if="!this.isContentAdd" color="green">
          <v-icon @click="contentAdd(true)">mdi-plus</v-icon>
        </v-btn>
        <v-btn v-else color="red">
          <v-icon @click="contentAdd(false)">mdi-minus</v-icon>
        </v-btn>
      </v-row>
    </v-container>
    <v-container v-if="isContentAdd">
      <h2>{{editorData.title}}</h2>
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
        <v-textarea v-else-if="editorData.editorType==='text'" outlined class="mt-4"></v-textarea>
        <h2 v-else-if="editorData.editorType==='img'">img</h2>
        <h2 v-else-if="editorData.editorType==='code'">code</h2>

        <pre v-else-if="editorData.editorType==='terminal'"><kbd>$ 야호</kbd></pre>
        <v-text-field
          v-else-if="editorData.editorType==='newIndex'"
          label="새 목차의 제목을 입력해 주세요 (제목 완성 시 오른쪽 더하기 버튼 또는 엔터키 누르기)"
          single-line
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
export default {
  methods: {
    contentAdd: function(payload) {
      this.isContentAdd = payload;
      this.editorData = {
        editorType: null,
        title: null,
        text: null,
        img: null,
        terminal: null,
        code: null
      };
    },
    editorInput: function(type) {
      if (type === "newIndex") {
        this.editorData.editorType = null;
      }
    }
  },
  data: function() {
    return {
      isContentAdd: false,
      editorData: {
        type: null,
        title: null,
        text: null,
        img: null,
        terminal: null,
        code: null
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
</style>