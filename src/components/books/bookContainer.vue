<template>
  <v-container>
    <v-card class="mx-auto" max-width="500" tile>
      <v-list shaped>
        <v-subheader>
          <h2>책 리스트</h2>
        </v-subheader>
        <v-list-item-group v-model="item" color="primary">
          <v-list-item
            v-for="(book, index) in books"
            :key="index"
            @click="changeToBookLayout(book)"
          >
            <v-list-item-icon>
              <v-icon large>mdi-book</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="display-1" v-text="book.name" />
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <v-row justify="center">
        <v-btn class="mt-5 mb-5" @click="editDialog = true">책 추가하기</v-btn>
      </v-row>
    </v-card>

    <edit-dialog v-if="editDialog" @closeDialog="closeDialog" type="book" />
  </v-container>
</template>

<script>
import fs from "fs";
import path from "path";
import editDialog from "../dialogs/editDialog";

export default {
  data: function() {
    return {
      books: null,
      editDialog: false,
      item: null
    };
  },
  components: {
    "edit-dialog": editDialog
  },
  created: function() {
    const result = path.join(__static, "/books");
    let dirList = fs.readdirSync(path.join(__static, "/books"), {
      withFileTypes: true
    });

    let bookList = [];
    let indexList = dirList.map((dir, i) => {
      const url = path.join(__static, `/books/${dir.name}`);
      if (dir.isDirectory()) {
        if (!fs.readdirSync(url).find(file => file === "index.json")) {
          fs.writeFileSync(
            `${url}/index.json`,
            this.getBasicIndexFile(dir.name)
          );
        }
        const rawData = fs.readFileSync(`${url}/index.json`);

        const indexList = JSON.parse(rawData);
        bookList.push({
          name: dir.name,
          indexList: indexList.indexList
        });
      }
    });
    this.books = bookList;
  },
  methods: {
    getBasicIndexFile: function(bookName) {
      const data = {
        indexList: [
          {
            name: bookName,
            subIndex: []
          }
        ]
      };
      return JSON.stringify(data);
    },
    changeToBookLayout: function(book) {
      // 1. book 인덱스 리스트 store 저장
      this.$store.commit("SAVE_BOOK", {
        name: book.name,
        indexList: book.indexList
      });
      this.$store.commit("SET_DRAWER", true);
    },
    closeDialog: function(payload) {
      if (
        payload.value &&
        !this.books.find(book => book.name === payload.value)
      ) {
        this.books = [
          ...this.books,
          {
            name: payload.value,
            indexList: {}
          }
        ];
        this.makeBookDir(payload.value);
        this.makeIndexFile(payload.value);
      }
      this.editDialog = false;
    },
    makeBookDir(name) {
      const url = path.join(__static, `/books/${name}`);
      fs.mkdir(url, err => {
        if (err) throw err;
      });
    },
    makeIndexFile(name) {
      const url = path.join(__static, `/books/${name}/index.json`);
      const data = {
        indexList: []
      };
      fs.writeFile(url, JSON.stringify(data), err => {
        if (err) throw err;
      });
    }
  }
};
</script>