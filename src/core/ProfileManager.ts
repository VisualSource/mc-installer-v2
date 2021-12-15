import { nanoid } from 'nanoid';
import type { Profile } from './Database';
import type Database from './Database';

interface EditableProfile {
    minecraft_version: string;
    loader: string;
    mod_list: string[]; 
    name: string;
}
interface NUUIDProfile {
    minecraft_version: string;
    loader: string;
    is_modpack: boolean;
    can_edit: boolean;
    can_delete: boolean;
    mod_list: string[]; 
    modpack_uuid: string | null;
    name: string;
}

export default class ProfileManager {
    static INSTANCE: ProfileManager | null;
    private db: Database = window._db;
    constructor() {
        if(ProfileManager.INSTANCE) return ProfileManager.INSTANCE;
        ProfileManager.INSTANCE = this;
    }
    public getAllProfiles(): Promise<Profile[]> {
        return this.db.getCollection("profiles").find({}).toArray() as Promise<Profile[]>;
    }
    public async getProfile(uuid: string): Promise<Profile> {
        const profile = await this.db.getCollection("profiles").findOne({ uuid })
        if(!profile) throw new Error(`No profile with uuid of ${uuid} exsists`);
        return profile as Profile;
    }
    public async addProfile(data: NUUIDProfile): Promise<void> {
        const uuid = nanoid();
        const profile: Profile = {
            ...data,
            uuid
        };
        await this.db.getCollection("profiles").insert(profile);
    }
    public async editProfile(uuid: string, data: EditableProfile): Promise<void> {
        await this.db.getCollection("profiles").update({ uuid }, data);
    }
    public async removeProfile(uuid: string){
        await this.db.getCollection("profiles").remove({ uuid });
    }
}