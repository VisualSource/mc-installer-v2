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
    xuid: string;
}

export interface UserCache {
    [xuid: string]: MicrosoftAccount
}

export async function login(): Promise<MicrosoftAccount> {
    return new Promise(async(ok,err)=>{
        let unlisenError: Function;
        let unlisenLogin: Function;
        unlisenError = await appWindow.once<string>(WindowEvents.LoginError, async (event)=>{
            unlisenLogin();
            err(event);
        });
        unlisenLogin = await appWindow.once<MicrosoftAccount>(WindowEvents.LoginComplete, async (account)=>{
            unlisenError();
            ok({
                xuid: account.payload.xuid,
                profile: account.payload.profile
            });
        });
        invoke<void>("login");
    });
}

export async function user_cache(): Promise<UserCache> {
    return invoke<UserCache>("get_user_cache");
}

export async function logout(xuid: string | undefined): Promise<void> {
    if(!xuid) throw new Error("Can't logout user with invaild xuid");

    await invoke<void>("logout",{ xuid });
}

export async function get_minecraft_news(items: number = 20): Promise<any> {
    return invoke("get_minecraft_news", { items });
}