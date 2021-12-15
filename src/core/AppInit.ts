import { gt } from 'semver';
import { nanoid } from 'nanoid';
interface IMetadata {
    loaders: string;
    mods: string;
    modpacks: string;
}

//@ts-ignore
window.nanoid = nanoid;
export default async function AppInit(){

    if(!navigator.onLine) return;

    const loader_version = localStorage.getItem("loaders");
    const mods_version = localStorage.getItem("mods");
    const modpacks_version = localStorage.getItem("modpacks");

    const raw_metadata = await fetch("https://raw.githubusercontent.com/VisualSource/mc-installer-v2/master/wellknowns/metadata.yml");

    const metadata = await parseYaml<IMetadata>(raw_metadata);

    if(!loader_version || gt(metadata.loaders,loader_version)) {
        //localStorage.setItem("loaders",metadata.loaders);
        const raw_loaders = await fetch("https://raw.githubusercontent.com/VisualSource/mc-installer-v2/master/wellknowns/loaders.yml");
        const raw = await parseYaml(raw_loaders);
        for(const loader of raw.loaders) {

        }

    }


}


async function parseYaml<T = any>(res: Response): Promise<T>{
    const raw = await res.text();
    return window.YAML.parse(raw) as T;
}