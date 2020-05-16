import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        drawer: false,
        book: null,
    },
    mutations: {
        TOGGLE_DRAWER(state) {
            state.drawer = !state.drawer;
        },
        SAVE_BOOK(state, payload) {
            state.book = payload
        }
    },
});

export default store;