import DB from "../../core/db"
export const load_content = async (route: string, setContent: (data: any)=>void, setLoading: (value: boolean)=>void) => {
    try {
        setLoading(true);
        const db = new DB();
        switch (route) {
            case "mod": {
                const mods = await db.getModList();
                if(!mods) throw new Error("Mods list is null");
                setContent(mods);
                setLoading(false);
                break;
            }
            case "modpack": {
                const modpack = await db.getModpackList();
                if(!modpack) throw new Error("Modpacks list is null");
                setContent(modpack);
                setLoading(false);
                break;
            }          
            case "profile": {
                const profile = await db.getProfileList();
                if(!profile) throw new Error("Profiles list is null");
                setContent(profile);
                setLoading(false);
                break;
            }
            default:
                setContent([]);
                setLoading(false);
                break;
        }
    } catch (error: any) {
        setContent([]);
        setLoading(false);
        console.error("Failed to load content |",error.toString());
    }
}