import { invoke } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';

export enum WindowEvents {
    LoginError = "rustyminecraft://login_error",
    LoginComplete = "rustyminecraft://login_complete"
}

export interface MicrosoftAccount {
    profile: {
        id: string;
        name: string;
        skins: {
            id: string;
            state: string;
            url: string;
            varient: string | null;
            alias: string | null;
        }[];
        capes: {
            id: string;
            state: string;
            url: string;
            varient: string | null;
            alias: string | null;
        }[]
    }
    access_token: string;
    refresh_token: string;
    xuid: string;
}

export interface UserCache {
    [xuid: string]: MicrosoftAccount
}

export async function login() {
    return new Promise(async(ok,err)=>{
        let unlisenError: Function;
        let unlisenLogin: Function;
        unlisenError = await appWindow.once(WindowEvents.LoginError, async (event)=>{
            unlisenLogin();
            console.error(event);
            err(event);
        });
        unlisenLogin = await appWindow.once(WindowEvents.LoginComplete, async (account)=>{
            unlisenError();
            console.log(account);
            ok(account);
        });
        invoke<void>("login");
    });
}

export async function user_cache(): Promise<UserCache> {
    return invoke<UserCache>("get_user_cache");
}

export async function logout(xuid: string): Promise<void> {
    await invoke<void>("logout",{ xuid });
}