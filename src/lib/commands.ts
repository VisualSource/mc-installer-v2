import { invoke } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import { nanoid } from 'nanoid';
import { toast } from 'react-hot-toast';
import type { MinecraftProfile, Loader } from './db';

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

export async function can_run_setup(): Promise<boolean> {
    return invoke<boolean>("can_run_setup");
}

export async function setup_complete(): Promise<void> {
    return invoke<void>("setup_complete");
}

interface RustyProfile {
    media: {
        icon: string
    },
    name: string,
    minecraft: string,
    loader: Loader,
    loader_version: string | null,
    dot_minecraft:  string | null,
    java: string | null,
    java_args: string | null,
    category: string,
    created: string | null,
    last_used: string | null,
    resolution: {
        width: number,
        height: number
    } | null,
}

export async function import_profiles(): Promise<MinecraftProfile[]> {
    let data: MinecraftProfile[] = [];

    const raw = invoke<RustyProfile[]>("import_profiles");
    toast.promise(raw,{
        loading: "Parsing...",
        error: "Failed to import profiles",
        success: "Imported profiles!"
    });

    const profiles = await raw;

    for (const profile of profiles) {
        data.push({
            mods: [],
            uuid: nanoid(),
            media: {
                banner: null,
                card: null,
                icon: profile.media.icon,
                links: []
            },
            name: profile.name,
            minecraft: profile.minecraft,
            dot_minecraft: profile.dot_minecraft,
            loader: profile.loader,
            loader_version: profile.loader_version,
            java: profile.java,
            jvm_args: profile.java_args ?? "-Xmx2G -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M",
            category: profile.category,
            created: profile.created ?? new Date().toUTCString(),
            last_used: profile.last_used,
            resolution: profile.resolution
        });
    }
   
    return data;
}