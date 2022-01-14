import {Db, Collection} from 'zangodb';

export type UUID = string;
export type Loader = "fabric" | "forge" | "optifine" | "iris" | "vanilla";
export type MCVersion = "1.17.0" | "1.17.1" | "1.17.*" | "1.18.0" | "1.18.1" | "1.18.*";

export interface ILoader {
    name: string;
    version: string;
    install: {
        cmd: string;
        headless: { version: string, url: string } | null;
    }
    download: Map<MCVersion,Map<Loader,string>>;
}

export interface Mod {
    uuid: UUID;
    name: string;
    required: Map<Loader,UUID[]>;
    inconpat: Map<Loader,UUID[]>;
    loaders: Loader[];
    mc: MCVersion[]
    version: string;
    media: {
        icon: string | null;
        list: string | null;
        background: string | null;
    }
    links: { name: string, path: string }[];
    description: string;
    category: string | null;
}
export interface ModPack {
    uuid: UUID;
    version: string;
    mods: UUID[];
    name: string;
    mc: MCVersion;
    loader: Loader;
    media: {
        icon: string | null;
        list: string | null;
        background: string | null;
    }
    links: { name: string, path: string }[];
    description: string;
    category: string | null;
}

export interface Profile {
    name: string;
    mc: MCVersion;
    loader: Loader;
    can_edit: boolean;
    can_delete: boolean;
    links: { name: string, path: string }[];
    modpack_uuid: UUID | null;
    uuid: UUID;
    mods: UUID[];
    media: {
        icon: string | null;
        list: string | null;
        background: string | null;
    }
    description: string;
    category: string | null;
    last_played: string | null;
}

export interface ModExpand {
    uuid: UUID;
    name: string;
    required: Map<Loader,Mod[]>;
    inconpat: Map<Loader,Mod[]>;
    loaders: Loader[];
    mc: MCVersion[]
    version: string;
    media: {
        icon: string | null;
        list: string | null;
        background: string | null;
    }
    links: { name: string, path: string }[];
    description: string;
    category: string | null;
}
export interface ModPackExpand {
    uuid: UUID;
    version: string;
    mods: Mod[];
    mc: MCVersion;
    name: string;
    loader: Loader;
    media: {
        icon: string | null;
        list: string | null;
        background: string | null;
    }
    links: { name: string, path: string }[];
    description: string;
    category: string | null;
}

export interface ProfileExpand {
    name: string;
    mc: MCVersion;
    loader: Loader;
    can_edit: boolean;
    can_delete: boolean;
    links: { name: string, path: string }[];
    modpack_uuid: UUID | null;
    uuid: UUID;
    mods: Mod[];
    media: {
        icon: string | null;
        list: string | null;
        background: string | null;
    }
    description: string;
    category: string | null;
    last_played: string | null;
}

export interface EditableProfileProps {
    description?: string;
    media?: {
        icon: string | null;
        list: string | null;
        background: string | null;
    }
    mods?: UUID[];
    name?: string;
    mc?: MCVersion;
    loader?: Loader;
    links?: { name: string, path: string }[];
    last_played?: string | null;
}

export type CategoryList = { 
    _id: string;
    data: { 
        name: string; 
        uuid: UUID, 
        media: { 
            icon: string | null;
            list: string | null;
            background: string | null; 
        } 
    }[]
}[];

export const minecraft_verions: MCVersion[] = ["1.17.0","1.17.1","1.18.1","1.18.0"];
export const minecraft_loaders: Loader[] = ["fabric","forge","iris","optifine","vanilla"];

export default class DB {
    static INSTANCE: DB | null = null;
    private db: Db;
    public mods: Collection;
    public modpacks: Collection;
    public profiles: Collection;
    public loaders: Collection;
    constructor(){
        if(DB.INSTANCE) return DB.INSTANCE;
        DB.INSTANCE = this;
        this.db = new Db("mod-content",1,{ mods: ["uuid"], profiles: ["uuid"], modpacks: ["uuid"], loaders: ["name"] });
        this.mods = this.db.collection("mods");
        this.modpacks = this.db.collection("modpacks");
        this.profiles = this.db.collection("profiles");
        this.loaders = this.db.collection("loaders");
    }
    public get on(){
        return this.db.addListener;
    }
    public get off(){
        return this.db.removeListener;
    }
    public async getModList(): Promise<CategoryList | null> {
        try {
            const mods = await this.mods.find({});
            return await mods.group({ _id: "$category", data: { $push: { name: "$name", uuid: "$uuid", media: "$media" } } }).toArray() as CategoryList;
        } catch (error: any) {
            console.error("Failed to get mods",error.toString());
            return null;
        }
    }
    public async getModpackList(): Promise<CategoryList | null> {
        try {
            const mods = await this.modpacks.find({});
            return await mods.group({ _id: "$category", data: { $push: { name: "$name", uuid: "$uuid", media: "$media" } } }).toArray() as CategoryList;
        } catch (error: any) {
            console.error("Failed to get modpack list");
            return null;
        }
    }
    public async getProfileList(): Promise<CategoryList | null> {
        try {
            const mods = await this.profiles.find({});
            return await mods.group({ _id: "$category", data: { $push: { name: "$name", uuid: "$uuid", media: "$media" } } }).toArray() as CategoryList;
        } catch (error: any) {
            console.error("Failed to get profile list");
            return null;
        }
    }
    public async getMod(uuid_get: UUID, expanded: boolean = true): Promise<ModExpand | null> {
        try {
            const {category, uuid,name,required,inconpat,loaders,mc,version,media,links,description} = await this.mods.findOne({ uuid: uuid_get }) as Mod;

            const required_expaned = new Map<Loader,Mod[]>();
            const inconpat_expaned = new Map<Loader,Mod[]>();

            if(expanded) for(const [loader,mods] of required.entries()){
                let mod_list: Mod[] = [];
                for(const mod_id of mods){
                    const mod = await this.mods.findOne({ uuid: mod_id }) as Mod;
                    mod_list.push(mod);
                }
                required_expaned.set(loader,mod_list);
            }

            if(expanded) for(const [loader,mods] of inconpat.entries()){
                let mod_list: Mod[] = [];
                for(const mod_id of mods){
                    const mod = await this.mods.findOne({ uuid: mod_id }) as Mod;
                    mod_list.push(mod);
                }
                inconpat_expaned.set(loader,mod_list);
            }

            return {
                uuid,
                name,
                loaders,
                mc,
                version,
                media,
                links,
                description,
                required: expanded ? required_expaned : required,
                inconpat: expanded ? inconpat_expaned : inconpat,
                category
            } as ModExpand;
        } catch (error: any) {
            console.error(`Failed to fetch mod ${uuid_get} |`, error.toString());
            return null;
        }
    }
    public async getLoader(name: Loader): Promise<ILoader | null> {
        try {
            return this.loaders.findOne({ name }) as Promise<ILoader>; 
        } catch (error: any) {
            console.error(`Failed to get loader ${name}`, error.toString());
            return null;
        }
    }
    public async getModPack(get_uuid: UUID, expanded: boolean = true): Promise<ModPackExpand | null> {
        try {
            const {name,category, uuid,version,mods,mc,loader,media,links,description} = await this.modpacks.findOne({ uuid: get_uuid}) as ModPack;

            const mods_exp: Mod[] = [];
            if(expanded)  for(const mod of mods){
                const mod_data = await this.mods.findOne({ uuid: mod }) as Mod;
                mods_exp.push(mod_data);
            }

            return {
                name,
                uuid,
                version,
                mc,
                loader,
                media,
                links,
                description,
                mods: expanded ? mods_exp : mods,
                category
            } as ModPackExpand;
            
        } catch (error: any) {
            console.error(`Failed to fetch modpack ${get_uuid} |`, error.toString());
            return null;
        }
    }
    public async getProfile(id: UUID, expanded: boolean = true): Promise<ProfileExpand | null> {
        try {
            const {last_played, category, name,mc,loader,can_delete,can_edit,links,uuid,mods,media,description} = await this.profiles.findOne({ uuid: id }) as Profile;

            const mods_exp: Mod[] = [];

            if(expanded) for(const mod of mods){
                const mod_data = await this.mods.findOne({ uuid: mod }) as Mod;
                mods_exp.push(mod_data);
            }

            return {
                name,
                mc,
                loader,
                links,
                uuid,
                media,
                description,
                can_edit,
                can_delete,
                mods: expanded ? mods_exp: mods,
                category,
                last_played
            } as ProfileExpand;
        } catch (error: any) {
            console.error(`Failed to fetch profile ${id} |`, error.toString());
            return null;
        }
    }
    public async deleteProfile(id: UUID): Promise<void> {
        try {
            await this.profiles.remove({ uuid: id});
            this.db.emit("update","update");
        } catch (error: any) {
            console.error(`Failed to delete profile ${id}`, error.toString());
        }
    }
    public async updateProfile(id: UUID, props: EditableProfileProps): Promise<void> {
        try {
            await this.profiles.update({ uuid: id }, props);
            this.db.emit("update","update");
        } catch (error: any) {
            console.error(`Failed to update profile ${id}`, error.toString());
        }
    }
    public async addMod(mod: Mod | Mod[]): Promise<this> {
        try {
            await this.mods.insert(mod);
        } catch (error: any) {
            console.error("Mod | Failed to insert new mod", error.toString());
        }
        return this;
    }
    public async addModpack(modpack: ModPack | ModPack[]): Promise<this> {
        try {
            await this.modpacks.insert(modpack);
        } catch (error: any) {
            console.error("Modpack | Failed to insert new modpack", error.toString());
        }
        return this;
    }
    public async addProfile(profile: Profile | Profile[]): Promise<this> {
        try {
            await this.profiles.insert(profile);
        } catch (error: any) {
            console.error("Failed to add new prfile",error.toString());
        }
        return this;
    }
    public async addLoader(loader: ILoader | ILoader[]): Promise<this> { 
        try {
            this.loaders.insert(loader);
        } catch (error: any) {
            console.error("Failed to insert loader", error.toString());
        }
        return this;
    }
}