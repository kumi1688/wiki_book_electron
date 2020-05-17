import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        component: () => import("./components/dashboard.vue"),
        children: [
            {
                name: "bookContainer",
                path: "",
                component: () => import("./components/books/bookContainer.vue"),
            },
            {
                name: 'bookComponent',
                path: 'book/:data',
                component: () => import('./components/books/bookComponent.vue')
            }
        ],
    },
];

const router = new VueRouter({
    routes, // `routes: routes`의 줄임
    // scrollBehavior: (to, from, savedPosition) => {
    //     let scrollTo = 0

    //     if (to.hash) {
    //       scrollTo = to.hash
    //     } else if (savedPosition) {
    //       scrollTo = savedPosition.y
    //     }

    //     return goTo(scrollTo)
    //   },
});

export default router;