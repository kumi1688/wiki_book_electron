
<template>
  <v-container v-if="!loading">
    <v-navigation-drawer :value="drawer" :clipped="$vuetify.breakpoint.lgAndUp" app width="500">
      <v-list dense>
        <!-- :prepend-icon="item.model ? item.icon : item['icon-alt']" -->
        <template v-for="(item,index) in items">
          <v-list-group
            v-if="item.children"
            :key="index"
            @contextmenu.prevent="(e)=>{
              editIndex = index
              $refs.menu.open(e)}
              "
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title class="pt-2 pb-2">
                  <h2>{{index}}장 {{ item.name }}</h2>
                </v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item
              v-for="(child, subIndex) in item.children"
              :key="subIndex"
              link
              @click="clickItem(index, subIndex, child)"
              @contextmenu.prevent="(e)=>{
              editIndex = index
              editSubIndex= subIndex
              $refs.menu.open(e)}
              "
            >
              <v-list-item-action v-if="child.type === 'subIndex'">
                <v-icon color="orange">mdi-plus</v-icon>
              </v-list-item-action>

              <v-list-item-action v-else>
                <h3>{{index}}-{{subIndex}}</h3>
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title>
                  <h3>{{ child.name }}</h3>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>

          <v-list-item
            v-else
            :key="index"
            link
            :to="item.to"
            @contextmenu.prevent="(e)=>{
              editIndex = index
              $refs.menu.open(e)}
              "
          >
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

        <v-list-item @click="addNewIndex">
          <v-list-item-action>
            <v-icon color="green">mdi-plus</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>
              <h3>목차 추가</h3>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <vue-context ref="menu">
      <li>
        <a @click="openBookDialog">이름 수정</a>
      </li>
      <li>
        <a @click="removeIndex">제거</a>
      </li>
      <li>
        <a @click="saveBook">메뉴 저장</a>
      </li>
    </vue-context>
    <edit-dialog
      v-if="editDialog"
      @closeDialog="closeDialog"
      :type="editSubIndex !== -1 ? 'subIndex': 'index'"
    />
  </v-container>
</template>

<script>
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import EditDialog from "../dialogs/editDialog";
import { VueContext } from "vue-context";
import "vue-context/dist/css/vue-context.css";

export default {
  components: {
    VueContext,
    "edit-dialog": EditDialog
  },
  computed: {
    drawer() {
      return this.$store.state.drawer;
    },
    book() {
      return this.$store.state.book;
    }
  },
  data: function() {
    return {
      items: [],
      loading: false,
      editDialog: false,
      editIndex: null,
      editSubIndex: -1,
      contextData: {
        index: null,
        value: null
      }
    };
  },

  watch: {
    book: {
      deep: true,
      immediate: true,
      handler: function(to, from) {
        this.initItems();
      }
    }
  },
  methods: {
    initItems() {
      let items = [];
      const bookName = this.$store.state.book.name;
      const bookIndexList = this.$store.state.book.indexList;
      items = bookIndexList.map(bookIndex => {
        return {
          icon: "mdi-chevron-up",
          "icon-alt": "mdi-chevron-down",
          model: false,
          name: bookIndex.name,
          children: bookIndex.subIndex
            ? bookIndex.subIndex.map((subIndex, i) => {
                return {
                  name: subIndex.name,
                  to: `/book/${bookName}-${bookIndex.name}-${subIndex.name}`
                };
              })
            : null
        };
      });
      items = this.addPlusIndexButton(items);
      this.items = items;
    },
    addPlusIndexButton(items) {
      const data = {
        name: "세부 목차 추가하기",
        type: "subIndex"
      };
      items.forEach(item => {
        if (item.children) {
          if (!item.children.find(ch => ch.type))
            item.children = [...item.children, data];
        } else item.children = [].concat(data);
      });
      return items;
    },
    removeIndex: function() {
      if (this.editSubIndex === -1) {
        this.items = [
          ...this.items.slice(0, this.editIndex),
          ...this.items.slice(this.editIndex + 1)
        ];
      } else {
        this.items[this.editIndex].children = [
          ...this.items[this.editIndex].children.slice(0, this.editSubIndex),
          ...this.items[this.editIndex].children.slice(this.editSubIndex + 1)
        ];
      }
    },
    closeDialog: function(payload) {
      if (!payload.value) {
        // 수정하지 않으면 그냥 넘어가기
      } else if (payload.value && this.editSubIndex === -1) {
        // 대 목차 수정
        // this.renameDirectory(this.items[this.editIndex].name, payload.value);
        this.items[this.editIndex].name = payload.value;
      } else {
        // 세부 목차 수정
        // this.renameDirectory(
        //   this.items[this.editIndex].children[this.editSubIndex].name,
        //   payload.value
        // );
        this.items[this.editIndex].children[this.editSubIndex].name =
          payload.value;
      }
      this.editIndex = null;
      this.editSubIndex = -1;
      this.editDialog = false;
    },
    openBookDialog: function() {
      this.editDialog = true;
    },
    saveBook: function() {
      const bookName = this.$store.state.book.name;
      const url = path.join(__static, `/books/${bookName}`);
      const data = {
        indexList: this.items
          .filter(item => item["name"] !== "새로운 항목")
          .map(item => {
            return {
              name: item.name,
              subIndex: item.children
                .filter(ch => ch["name"] !== "세부 목차 추가하기")
                .map(ch => {
                  return { name: ch["name"] };
                })
            };
          })
      };
      this.makeDirectory(data.indexList);
      fs.writeFileSync(`${url}/index.json`, JSON.stringify(data));
    },
    renameDirectory: function(oldName, newName) {
      const bookName = this.$store.state.book.name;

      if (this.editSubIndex === -1) {
        // index 수정
        const url = path.join(__static, `/books/${bookName}`);
        const oldPath = `${url}/${oldName}`;
        const newPath = `${url}/${newName}`;
        // if(oldName === '새로운 항목')

        // fs.renameSync(oldPath, newPath);
      } else {
        // subindex 수정
        const url = path.join(__static, `/books/${bookName}`);
        const oldPath = `${url}/${this.items[this.editIndex].name}/${oldName}`;
        const newPath = `${url}/${this.items[this.editIndex].name}/${newName}`;
        fs.renameSync(oldPath, newPath);
      }
    },
    makeDirectory: function(indexList) {
      const bookName = this.$store.state.book.name;
      const url = path.join(__static, `/books/${bookName}`);
      indexList.map(index => {
        if (!fs.readdirSync(url).includes(index.name))
          fs.mkdirSync(`${url}/${index.name}`);

        index.subIndex.map(si => {
          if (!fs.readdirSync(`${url}/${index.name}`).includes(si.name))
            fs.mkdirSync(`${url}/${index.name}/${si.name}`);
        });
      });
    },
    addNewIndex: function() {
      this.items = this.items.concat({
        icon: "mdi-chevron-up",
        "icon-alt": "mdi-chevron-down",
        name: "새로운 항목"
      });
      this.items = this.addPlusIndexButton(this.items);
    },
    addNewSubIndex: function(index, subIndex) {
      this.loading = true;
      const bookName = this.$store.state.book.name;
      // 세부 항목 추가는 빼놓기
      const lastItem = this.items[index].children[
        this.items[index].children.length - 1
      ];
      this.items[index].children = [
        ...this.items[index].children.slice(0, subIndex),
        {
          name: "새로운 세부 항목",
          to: `/book/${bookName}-${this.items[index].name}-새로운 세부 항목`
        },
        lastItem
      ];
      this.loading = false;
      console.log(this.items[index].children);
    },
    clickItem(index, subIndex, child) {
      if (child.type === "subIndex") {
        this.addNewSubIndex(index, subIndex);
        return;
      }
      if (this.$route.path !== child.to) this.$router.push(child.to);
    }
  }
};
</script>