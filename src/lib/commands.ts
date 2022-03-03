import { invoke } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import { nanoid } from 'nanoid';
import { toast } from 'react-hot-toast';
import { Database,  type MinecraftProfile, type Loader } from './db';
import { gt, coerce, SemVer } from 'semver';

export enum WindowEvents {
    LoginError = "rustyminecraft://login_error",
    LoginComplete = "rustyminecraft://login_complete"
}
export enum GameLaunchStatus {
    Progress = "rustyminecraft://launch_status",
    Error = "rustyminecraft://launch_error",
    Ok = "rustyminecraft://launch_ok"
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
    refresh_token: string;
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
            ok(account.payload);
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

export async function is_game_running(): Promise<boolean> {
    return invoke<boolean>("is_game_running");
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

export async function run_game(xuid: string, profile_uuid: string) {
    if(!xuid || !profile_uuid) throw new Error("Invaild xuid or profile uuid");
    const profile = await Database.getItem(profile_uuid,"profiles");
    const users = await user_cache();
    const player = users[xuid];

    await invoke("run_game", { settings: {
        game_dir: profile.dot_minecraft,
        java_dir: profile.java,
        jvm_args: profile.jvm_args,
        refresh_token: player.refresh_token,
        minecraft: profile.minecraft,
        loader: profile.loader,
        loader_version: profile.loader_version
    } });

    await Database.profileEdit({ uuid: profile.uuid, data: { last_used: new Date().toUTCString() } }, "update");
}

export interface MinecraftVersion {
    minecraft: string;
    loader: Loader,
    loader_version: string | null
}

export async function get_versions(type: Loader) {
    switch(type) {
        case "forge": {
            const data = await invoke<{ [key: string]: string[] }>("stable_forge_versions");
            return Object.keys(data).sort((a,b)=>{
                if(gt(coerce(a) as SemVer ,coerce(b) as SemVer)) return -1;
                return 1;
            });
        }
        case "fabric": {
            return invoke<string[]>("stable_fabric_versions")
        }
        case "optifine":{
            const data = await invoke<{ [key: string]: string[] }>("stable_optifine_versions");
            return Object.keys(data).sort((a,b)=>{
                if(gt(coerce(a) as SemVer ,coerce(b) as SemVer)) return -1;
                return 1;
            });
        }
        default: 
            return invoke<string[]>("stable_vanilla_versions")
    }
}

export async function get_loader_versions(type: Loader, minecraft: string): Promise<string[]> {
    switch (type) {
        case "forge":{
            const data = await invoke<{ [key: string]: string[] }>("stable_forge_versions");

            if(minecraft === "latest-release") {
               let key = Object.keys(data).map(value=>coerce(value)?.raw ?? "0.0.0");

                const latest = key.reduce((pre,cur)=>{ 
                    if(gt(pre,cur,{ loose: true })) return pre; else return cur;
                });

               return data[latest];
            }

            if(!data[minecraft]) return [];

            return data[minecraft];
        }
        case "optifine": {
            const data = await invoke<{ [key: string]: string[] }>("stable_optifine_versions");
            if(minecraft === "latest-release") {
                let key = Object.keys(data).map(value=>coerce(value)?.raw ?? "0.0.0");
 
                 const latest = key.reduce((pre,cur)=>{ 
                     if(gt(pre,cur,{ loose: true })) return pre; else return cur;
                 });
 
                return data[latest];
            }
 
            if(!data[minecraft]) return [];
 
            return data[minecraft];
        }
        default:
            return [];
    }
}

//@ts-ignore
window.test = get_loader_versions;
