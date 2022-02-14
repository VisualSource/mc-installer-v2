import { Db } from 'zangodb';
import { nanoid } from 'nanoid';

export type Loader = "vanilla" | "forge" | "fabric" | "optifine";
type ContentType = "mods" | "modpacks" | "profiles";

export interface Media {
  icon: string | null;
  banner: string | null,
  links: {
    name: string, route: string
  }[]
}

export interface ModRef {
  name: string;
  media: Media,
  uuid: string,
  category: string;
  required: string[]
  supports: Loader[]
  mc: string[],
  description: string
}
export interface ModpackDef {
  name: string;
  uuid: string;
  media: Media;
  category: string;
  mc: string[];
  supports: Loader[],
  mods: string[],
  description: string
}

export interface MinecraftProfile {
  media: Media,
  uuid: string;
  name: string;
  jvm_args: string;
  minecraft: string;
  loader: Loader,
  loader_version: string | null,
  java: null | string,
  category: string;
  created: string;
  last_used: string | null,
  mods: string[]
}

class Database {
  static INSTANCE: Database | null = null;
  static GetInstance(): Database {
    if(Database.INSTANCE) return Database.INSTANCE;
    return new Database()

  }
  private db: Db;
  constructor(){
    if(Database.INSTANCE) return Database.INSTANCE;
    //@ts-ignore
    window.__DB = this;
    this.db = new Db("rustyminecraftclient",2,{ mods: ["uuid"], profiles: ["uuid"], modpacks: ["uuid"] });
  }
  public async updateProfile(uuid: string, params: { 
    media?: Media, 
    name?: string, 
    jvm_args?: string | null, 
    java: string | null,
    minecraft?: string,
    loader?: Loader,
    loader_version?: string | null,
    category?: string,
    last_used?: string 
  }) {
    const profiles = this.db.collection("profiles");
    await profiles.update({ uuid },params);
  }
  public async deleteProfile(uuid: string) {
    const profiles = this.db.collection("profiles");
    await profiles.remove({ uuid });
  }
  public async createProfile(profile: { 
    media: Media, 
    name: string, 
    jvm_args: string | null,
    java: string, 
    minecraft: string, 
    loader: Loader, 
    loader_version: string | null,
    category: string
  }) {
    const profiles = this.db.collection("profiles");
    const uuid = nanoid();

    await profiles.insert({
      ...profile,
        uuid,
        mods: [],
        created: new Date().toUTCString(),
        last_used: null
    });
  }
  public async getProfiles(): Promise<MinecraftProfile[]> {
    const profiles = this.db.collection("profiles");
    return profiles.find({}).toArray() as Promise<MinecraftProfile[]>;
  }
  public async getMods(): Promise<ModRef[]> {
    const mods = this.db.collection("mods");
    return mods.find({}).toArray() as Promise<ModRef[]>;
  }
  public async getModpacks(): Promise<ModpackDef[]> {
    const modpacks = this.db.collection("modpacks");
    return modpacks.find({}).toArray() as Promise<ModpackDef[]>;
  }
  public async getProfile(uuid: string): Promise<MinecraftProfile> {
    const profiles = this.db.collection("profiles");
    const data = await profiles.findOne({ uuid }) as Promise<MinecraftProfile>;
    console.log(data);
    return data;
  }
  public async getMod(uuid: string): Promise<ModRef> {
    const mods = this.db.collection("mods");
    return mods.findOne({ uuid }) as Promise<ModRef>;
  }
  public async getModpack(uuid: string): Promise<ModpackDef> {
    const modpacks = this.db.collection("modpacks");
    return modpacks.findOne({ uuid }) as Promise<ModpackDef>;
  }
}

export async function getItem(type: ContentType, uuid: string) {
  const db = Database.GetInstance();
  if(type === "modpacks") return await db.getModpack(uuid);
  if(type === "profiles") return await db.getProfile(uuid);
  return await db.getMod(uuid);
}

export async function getListCategory(type: ContentType){
    const db = Database.GetInstance();
    let categoites: { [category: string]: any[] } = {};

    const getData = async () => {
        if(type === "profiles") return db.getProfiles();
        if(type === "modpacks") return db.getModpacks();
        return db.getMods();
    }

    const data = await getData();

    for(const item of data) {
      if(!categoites[item.category]) {
          categoites[item.category] = [];
      }
      categoites[item.category].push(item);
    }

    return categoites;
}

export async function fetchList(type: ContentType) {
    const db = Database.GetInstance();
    if(type === "profiles") return db.getProfiles();
    if(type === "modpacks") return db.getModpacks();
    return db.getMods();
}