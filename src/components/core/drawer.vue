
<template>
  <v-container v-if="!loading">
    <v-navigation-drawer :value="drawer" :clipped="$vuetify.breakpoint.lgAndUp" app width="350">
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
              :to="child.to"
              @click="addNewSubIndex(index, subIndex)"
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
    </vue-context>
    <edit-dialog
      v-if="editDialog"
      @closeDialog="closeDialog"
      :type="editSubIndex ? 'subIndex': 'index'"
    />
  </v-container>
</template>

<script>
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
    }
  },
  created: function() {
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
  data: function() {
    return {
      items: [],
      loading: false,
      editDialog: false,
      editIndex: null,
      editSubIndex: null,
      contextData: {
        index: null,
        value: null
      }
    };
  },
  watch: {
    items: {
      deep: true,
      handler: function(from, to) {
        console.log(from, to);
      }
    }
  },
  methods: {
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
    addSubIndex(index) {
      const bookName = this.$store.state.book.name;
      const bookIndexList = this.$store.state.book.indexList;
      this.items[index].children.push({});
      const data = {
        name: "새로운 세부 목차"
      };
    },
    removeIndex: function() {
      this.items = [
        ...this.items.slice(0, this.editIndex),
        ...this.items.slice(this.editIndex + 1)
      ];
    },
    closeDialog: function(payload) {
      if (payload.value && !this.editSubIndex)
        this.items[this.editIndex].name = payload.value;
      else
        this.items[this.editIndex].children[this.editSubIndex].name =
          payload.value;
      this.editIndex = null;
      this.editSubIndex = null;
      this.editDialog = false;
    },
    openBookDialog: function() {
      this.editDialog = true;
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
    }
  }
};
</script>