import { get_cached_users, logout_microsoft, login_microsoft } from './cmds';
export interface MSAccount {
    profile: {
        id: string;
        name: string;
        skins: any[];
        capes: any[];
    }
    ccess_token: string;
    refresh_token: string;
    active: undefined | boolean
}

export default class Accounts {
    private _accounts: { [id: string]: MSAccount } = {};
    private _loaded: boolean = false;
    public active: string | undefined; 
    static INSTANCE: Accounts | null = null;
    constructor(){
        if(Accounts.INSTANCE) return Accounts.INSTANCE;
        Accounts.INSTANCE = this;
        this.init();
    }
    private async init() {
        try {
            get_cached_users().then(value=>{
                this._accounts = value;

                let user = localStorage.getItem("active_user");
                if(user) {
                    this.active = user;
                }

                this._loaded = true;
            })
        } catch (error) {
            console.error(error);
        }
    }
    public async getUser(uuid: string | undefined): Promise<MSAccount | undefined> {
        if(!uuid) return;
        if(!this._loaded) await this.init();
        return this._accounts[uuid];
    }
    public async getAccounts(): Promise<MSAccount[]> {
        if(!this._loaded) await this.init();
        return Object.values(this._accounts);
    }
    public setActive(id: string) {
        this.active = id;
        localStorage.setItem("active_user",this.active);
        return this.active;
    }
    public async addAccount(): Promise<MSAccount[]> {
        const user =  await login_microsoft();
        if(!user) throw new Error("Login failed");
        this._accounts[user.profile.id] = user;
        return this.getAccounts();
    }
    public async removeAccount(uuid: string): Promise<MSAccount[]> {
        delete this._accounts[uuid];
        if(this.active === uuid){
            this.active = undefined;
        }
        await logout_microsoft(uuid);
        return this.getAccounts();
    }
}