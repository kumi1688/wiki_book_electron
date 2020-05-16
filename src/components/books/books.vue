<template>
  <v-container>
    <h2>책 리스트</h2>
    <ul v-for="(book, index) in books" :key="index">
      <li @click="changeToBookLayout(book)">
        <h2>{{book.name}}</h2>
      </li>
    </ul>
  </v-container>
</template>

<script>
import fs from "fs";
import path from "path";

export default {
  data: function() {
    return {
      books: null
    };
  },
  created: function() {
    const result = path.join(__static, "/books");
    let bookList = fs.readdirSync(path.join(__static, "/books"), {
      withFileTypes: true
    });
    let indexList = bookList.map((dir, i) => {
      if (dir.isDirectory()) {
        const url = path.join(__static, `/books/${dir.name}/index.json`);
        const rawData = fs.readFileSync(url);
        const indexList = JSON.parse(rawData);
        bookList[i].indexList = indexList.indexList;
      }
    });
    this.books = bookList;
  },
  methods: {
    changeToBookLayout: function(book) {
      // 1. book 인덱스 리스트 store 저장
      this.$store.commit("SAVE_BOOK", {
        name: book.name,
        indexList: book.indexList
      });
      this.$store.commit("TOGGLE_DRAWER");
    }
  }
};
</script>