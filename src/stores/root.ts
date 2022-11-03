import { defineStore } from "pinia";
import axios, { AxiosError } from "axios";
import { SnackbarProgrammatic as Snackbar } from "buefy";
import { BehaviorSubject } from "rxjs";
import router from "@/router";

interface User {
    id: number;
    username: string;
    is_admin: boolean;
    theme: string;
    language: string;
    timezone: string;
    entry_sorting_direction: string;
    stylesheet: string;
    google_id: string;
    openid_connect_id: string;
    entries_per_page: number;
    keyboard_shortcuts: boolean;
    show_reading_time: boolean;
    entry_swipe: boolean;
    last_login_at: Date;
}

const token = localStorage.getItem("token") || "";
if (token !== "") {
    axios.defaults.headers.common["X-Auth-Token"] = token;
}

type rootState = "init" | "checking" | "ready";

export const useRootStore = defineStore({
    id: "root",
    state: () => ({
        backend: axios.create({ baseURL: "https://fluchs.testha.se" }),
        user: {} as User,
        isLoggedIn: false,
        state: new BehaviorSubject<rootState>("init"),
    }),
    actions: {
        async getUserProfile() {
            this.state.next("checking");
            this.user = await this.backend
                .get("/v1/me")
                .then((r) => {
                    this.isLoggedIn = true;
                    this.state.next("ready");
                    return r.data;
                })
                .catch((e) => {
                    this.state.next("ready");
                    this.showError(e);
                });
        },
        registerToken(token: string) {
            this.backend.defaults.headers.common["X-Auth-Token"] = token;
            localStorage.setItem("token", token);
            return this.getUserProfile();
        },
        clearToken() {
            localStorage.removeItem("token");
            this.isLoggedIn = false;
        },
        showError(e: any) {
            console.error(e);
            if (e instanceof AxiosError && e.response?.status === 401) {
                this.isLoggedIn = false;
                return router.push("/");
            }
            Snackbar.open({
                type: "is-danger",
                message: `${e}`,
                indefinite: true,
                position: "is-bottom",
            });
        },
    },
});
