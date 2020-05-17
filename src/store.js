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
            if (!state.book) return;
            state.drawer = !state.drawer
        },
        SET_DRAWER(state, payload) {
            state.drawer = payload
        },
        SAVE_BOOK(state, payload) {
            state.book = payload
        }
    },
});

export default store;