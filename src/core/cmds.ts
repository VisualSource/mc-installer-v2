import { invoke } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import {Loader} from './db';
import {nanoid} from "nanoid";

export interface MinecraftNews {
    default_tile: {
        sub_header: string;
        image: {
            content_type: "image";
            imageURL: string;
            alt: string | null
        },
        tile_size: string;
        title: string;
    }
    articleLang: string;
    primary_category: string;
    categories: string[];
    article_url: string;
    publish_data: string;
    tags: string[];
    preferred_tile: {
        sub_header: string;
        image: {
            content_type: "image";
            imageURL: string;
            alt: string | null;
        },
        tile_size: string;
        title: string;
    } | null
}

export const login_microsoft = (): Promise<any> => {
    return new Promise((ok,err)=>{
        appWindow.once('mcrust://login_micosoft', ({ event, payload }) => {
            console.log(event,payload);
            if (!payload) {
                err("Failed to login");
                return;
            }
            ok(payload);
        });
        invoke<void>("login_microsoft_account");
    });
}
export const refresh_microsoft = (token: string): Promise<{}> => {
    return invoke("refresh_microsoft_account",{refresh_token:token});
} 

const versions: { [loader: string]: null | { versions: string[], cached: string } } = {
    vanilla: null,
    forge: null,
    fabric: null
}

const version_invoke: {[loader: string]:string} = {
    vanilla: "get_vanilla_versions",
    forge: "get_forge_versions",
    fabric: "get_fabric_verions"
}

export async function fetchVerions(loader: Loader): Promise<{ cached: string, versions: string[] }> {
    if(versions[loader]) {
        return versions[loader] as {versions: string[], cached: string };
    }
    const raw = localStorage.getItem(`${loader}_versions`);
    if(raw) {
        const content: { cached: string, versions: string[] } = JSON.parse(raw);
        const today = new Date().toDateString();
        const n_today = Date.parse(today);
        const date = Date.parse(content.cached);
        if((n_today - date) < 60480000) { // 1 week
            versions.vanilla = content;
            return content  
        }
    }
    const content = await invoke<{versions: string[]}>(version_invoke[loader]);
    const value = { cached: new Date().toDateString(), versions: content.versions };
    versions[loader] = value;
    localStorage.setItem(`${loader}_versions`,JSON.stringify(value));
    return value;
}

export const get_minecraft_news = (documents: number = 20) => {
    return invoke<MinecraftNews[]>("get_minecraft_news",{ documents: documents.toString() });
}

export const run_install = (): Promise<void> => {
    return invoke<void>("run_install",{ manifest: {
        loader: "vanilla",
        version: "1.17.1",
        mods: [],
    } });
}

export const run_minecraft = (options: any) => {
    return invoke("run_minecraft",{ manifest: {
        uuid: `${nanoid(8)}-${nanoid(4)}-${nanoid(4)}-${nanoid(4)}-${nanoid(12)}`,
        token: "",
        username: "Player 4",
        version: "1.17.1",
        loader: "vanilla"
    } });
}

