<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="700">
      <v-card class="mx-auto">
        <v-card-title class="headline">{{title}}</v-card-title>
        <v-text-field class="mr-5 ml-5 display-1" height="50" single-line v-model="editData.value" />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="closeDialog(false)">취소</v-btn>
          <v-btn color="green darken-1" text @click="closeDialog(true)">{{buttonName}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  computed: {
    title() {
      if (this.type === "book") return "추가할 책 제목을 입력해주세요";
      else if (this.type === "subIndex")
        return "수정할 세부 항목 제목을 입력해주세요";
      else return "수정할 제목을 입력해주세요";
    },
    buttonName() {
      if (this.type === "book") return "추가";
      else return "수정";
    }
  },
  props: ["type"],
  created: function() {
    this.dialog = true;
  },
  methods: {
    closeDialog: function(payload) {
      this.dialog = false;
      this.$emit("closeDialog", {
        value: payload ? this.editData.value : null
      });
    }
  },
  data() {
    return {
      dialog: false,
      editData: {
        value: null
      }
    };
  }
};
</script>