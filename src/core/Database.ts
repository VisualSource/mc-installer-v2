import { Db } from 'zangodb';

export interface Profile {
    minecraft_version: string;
    loader: string;
    is_modpack: boolean;
    can_edit: boolean;
    can_delete: boolean;
    mod_list: string[]; 
    modpack_uuid: string | null;
    name: string;
    uuid: string;
}

export interface Mod {
    _uuid: string;
    name: string;
    img: string;
    desc_short: string;
    desc_long: string;
    supported_versions: {
        version: string;
        download: string;
    }[];
    supported_loaders: string[];
    inconpadable: string[] | null;
    requires: { uuid: string, name: string; }[] | null;
    links: {
      name: string;
      url: string;  
    }[]
}
export interface Modpack {
    _uuid: string;
    name: string;
    img: string;
    mc_version: string;
    mods: string[];
    desc_short: string;
    desc_long: string;
    loader: string;
    version: string;
}
export interface Loader {
    name: string;
    uuid: string;
    install_cmd: string;
    headless_runner: null | {
        uuid: string;
        download: string;
        version: string;
    }
    versions: { 
        download: string; 
        version: string; 
    }[]
}

export default class Database {
    private db = new Db("mod-content",1, { mods: ["_uuid"], modpacks: ["_uuid"], loaders: ["uuid"], profiles: ["uuid"] });
    private async addDoc(collection: "mods" | "modpacks" | "loaders" | "profiles", content: any){
        try {
            const doc = this.db.collection(collection);
            await doc.insert(content);
        } catch (error) {
            console.error(error);
        }
    }
    public async addLoader(doc: Loader) {
        await this.addDoc("loaders",doc);
    }
    public async addMod(doc: Mod){
       await this.addDoc("mods",doc);
    }
    public async addModpack(doc: Modpack) {
        await this.addDoc("modpacks",doc);
    }
    public async addProfile(doc: Profile) {
       await this.addDoc("profiles",doc);
    }
    public getCollection(item: "mods" | "modpacks" | "loaders" | "profiles"){
        return this.db.collection(item);
    }
} 