import { Db } from 'zangodb';
import { nanoid } from 'nanoid';

export type Loader = "vanilla" | "forge" | "fabric" | "optifine";
type ContentType = "mods" | "modpacks" | "profiles";

export interface Media {
  icon: string | null;
  banner: string | null;
  card: string | null;
  links: {
    name: string, route: string
  }[];
}

export interface ModRef {
  name: string;
  media: Media;
  uuid: string;
  category: string;
  required: string[];
  supports: Loader[];
  incompatable: string[];
  mc: string[];
  description: string;
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
  dot_minecraft: string | null,
  java: null | string,
  category: string;
  created: string;
  last_used: string | null,
  resolution: {
    width: number,
    height: number
  } | null
  mods: string[]
}
export interface ICreatableProfile {
  media: Media,
  name: string;
  jvm_args: string;
  minecraft: string;
  loader: Loader,
  loader_version: string | null,
  dot_minecraft: string | null,
  java: null | string,
  mods?: string[];
  category: string;
  resolution: {
    width: number,
    height: number
  } | null
}

export const JVM_ARGS = "-Xmx2G -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M";

export class Database {
  static INSTANCE: Database | null = null;
  static GetInstance(): Database {
    if(Database.INSTANCE) return Database.INSTANCE;
    return new Database()

  }
  static async getItem<T = MinecraftProfile>(uuid: string | undefined, type: "mods" | "modpacks" | "profiles" = "profiles"): Promise<T> {
      if(!uuid) throw new Error("Missing uuid");
      const db = Database.GetInstance();
      const col = db.getCollection(type);
      return col.findOne({ uuid }) as Promise<T>;
  }
  static async addBulkProfiles(data: MinecraftProfile[]): Promise<void> {
    const db = Database.GetInstance();
    const profiles = db.getCollection("profiles");
    return profiles.insert(data);
  }
  static async profileEdit(props: { uuid: string, data: any }, type: "update" | "delete") {
    const db = Database.GetInstance();
    if(type === "delete") {
      await db.deleteProfile(props.uuid);
      return { text: await fetchList("profiles"), category: await getListCategory("profiles") };
    }

    await db.updateProfile(props.uuid, props.data);
    return { text: await fetchList("profiles"), category: await getListCategory("profiles") };
  }
  static async createProfile(props: ICreatableProfile) {
    const db = Database.GetInstance();

    await db.createProfile(props);

    return { text: await fetchList("profiles"), category: await getListCategory("profiles") };
  }
  static async getModList(list: string[] = []): Promise<ModRef[]>{
    let mods: ModRef[] = [];

    for(const mod of list) {
      const i = await Database.getItem<ModRef>(mod,"mods");
      mods.push(i);  
    }

    return mods;
  }
  private db: Db;
  constructor(){
    if(Database.INSTANCE) return Database.INSTANCE;
    //@ts-ignore
    window.__DB = this;
    this.db = new Db("rustyminecraftclient",2,{ mods: ["uuid"], profiles: ["uuid"], modpacks: ["uuid"] });
  }
  public collectionProfiles() {
    return this.db.collection("profiles");
  }
  public getCollection(col: "mods" | "modpacks" | "profiles"){
    return this.db.collection(col);
  }
  public async updateProfile(uuid: string, params: { 
    media?: Media, 
    name?: string, 
    jvm_args?: string | null, 
    java?: string | null,
    minecraft?: string,
    loader?: Loader,
    mods?: string[],
    loader_version?: string | null,
    category?: string,
    last_used?: string 
  }) {
    const profiles = this.db.collection("profiles");
    if("mods" in params) {
      const profile = await profiles.findOne({ uuid }) as MinecraftProfile;
      const mods = profile.mods.concat((params.mods as string[]));
      
      return profiles.update({ uuid },{ ...params, mods });
    }
    return profiles.update({ uuid },params);
  }
  public async deleteProfile(uuid: string) {
    const profiles = this.db.collection("profiles");
    await profiles.remove({ uuid });
  }
  public async createProfile(profile: ICreatableProfile) {
    const profiles = this.db.collection("profiles");
    const uuid = nanoid();

    await profiles.insert({
      ...profile,
        uuid,
        mods: profile?.mods ?? [],
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