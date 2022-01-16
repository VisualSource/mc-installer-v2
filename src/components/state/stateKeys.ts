import {atom} from 'recoil';

export const startup_modal = atom({
    key: "STARTUP_MODAL",
    default: false
});

export const game_running = atom({
    key: "MC_IS_RUNNING",
    default: false
});

export const profile_modal = atom<{mod: string | null, show: boolean}>({
    key: "PROFILE_MODAL",
    default: {
        mod: null,
        show: false
    }
});
export const edit_profile_dialog = atom<{profile: string | null, show: boolean}>({
    key: "EDIT_PROFILE_DIALOG",
    default: {
        profile: null,
        show: false
    }
});
export const message_dialog = atom({
    key: "MESSAGE_DIALOG",
    default: {
        msg: "",
        title: "Message",
        show: false
    }
});
export const add_profile_dialog = atom({
    key: "ADD_PROFILE_DIALOG",
    default: false
});
export const modpack_install_dialog = atom<{show: boolean; pack: string | null}>({
    key: "MODPACK_INSTALL_DIALOG",
    default: {
        show: false,
        pack: null
    }
});


export interface MSAccounts {
    active: boolean
    uuid: string;
    email: string;
    username: string;
}

export const ms_accounts = atom<MSAccounts[]>({
    key: "MS_ACCOUNTS",
    default: []
}); 