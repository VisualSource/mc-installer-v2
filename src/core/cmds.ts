import { invoke } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';

appWindow.listen('mcrust://login_micosoft', ({ event, payload }) => {
    console.log(event,payload);
})

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

export const login_microsoft = (): Promise<void> => {
    return invoke<void>("login_microsoft_account");
}
export const login_mojang = (): Promise<void> => {
    return invoke<void>("login_mojang_account");
}

export const get_available_minecraft_versions = () => {
    return invoke<{ versions: string[] }>("get_available_minecraft_versions");
}

export const get_fabric_verions = () => {
    return invoke<{versions: { version: string; stable: boolean }[] }>("get_fabric_verions");
}
export const get_forge_verions = () => {
    return invoke<{ versions: string[] }>("get_forge_versions");
}

export const get_minecraft_news = (documents: number = 20) => {
    return invoke<MinecraftNews[]>("get_minecraft_news",{ documents: documents.toString() });
}


