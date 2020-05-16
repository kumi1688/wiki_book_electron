import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        drawer: false,
    },
    mutations: {
        TOGGLE_DRAWER(state) {
            console.log(state.drawer);
            state.drawer = !state.drawer;
        },
    },
});

export default store;