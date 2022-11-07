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
const server = localStorage.getItem("server") || "";
if (token !== "" && server !== "") {
    axios.defaults.headers.common["X-Auth-Token"] = token;
    axios.defaults.baseURL = server;
}

type rootState = "init" | "checking" | "ready" | "auth_needed";

export const useRootStore = defineStore({
    id: "root",
    state: () => ({
        backend: axios.create(),
        server: server,
        token: token,
        user: {} as User,
        isLoggedIn: false,
        state: new BehaviorSubject<rootState>("init"),
    }),
    actions: {
        async getUserProfile() {
            if (!this.server || !this.token) {
                this.state.next('auth_needed');
                throw Error("Not logged in");
            }
            this.state.next("checking");
            this.user = await this.backend
                .get("/v1/me")
                .then((r) => {
                    this.isLoggedIn = true;
                    this.state.next("ready");
                    return r.data;
                })
                .catch((e) => {
                    this.state.next("auth_needed");
                    throw e;
                });
        },
        registerToken(server: string, token: string) {
            this.server = server;
            this.token = token;
            this.backend.defaults.baseURL = this.server;
            this.backend.defaults.headers.common["X-Auth-Token"] = this.token;
            localStorage.setItem("token", this.token);
            localStorage.setItem("server", this.server);
            return this.getUserProfile();
        },
        clearToken() {
            localStorage.removeItem("token");
            this.token = "";
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
