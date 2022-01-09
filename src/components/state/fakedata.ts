import { nanoid } from "nanoid";
import DB,{Mod,Profile,ModPack} from '../../core/db';

const a = nanoid();
const b = nanoid();

const modpacks: ModPack[] = [
    {
        version: "0.0.0",
        category: "Test",
        description: "TEST Modpack",
        links: [],
        loader: "iris",
        mc: "1.18.1",
        media: {
            icon: null,
            background: null,
            list: null
        },
        mods: [a,b],
        uuid: nanoid(),
        name: "Test Modpack",
    }
];

const profiles: Profile[] = [
    {
        can_delete: true,
        can_edit: true,
        category: "General",
        description: "Auto generated default profile",
        links: [],
        loader: "fabric",
        mc: "1.18.1",
        media: {
            icon: null,
            background: null,
            list: null
        },
        mods: [a,b],
        name: "Default",
        uuid: nanoid(),
        last_played: null,
    }
];

const mods: Mod[] = [
    {
        name: "Better Third Person",
        uuid: a,
        category: "Cosmetic",
        inconpat: new Map(),
        required: new Map(),
        links: [
            { name: "CurseForge", path: "https://www.curseforge.com/minecraft/mc-mods/better-third-person" },
        ],
        media: {
            icon: "https://media.forgecdn.net/avatars/thumbnails/392/806/64/64/637587416534783614.png",
            background: "https://i.imgur.com/ian8HrF.png",
            list: null
        },
        mc: ["1.18.*"],
        loaders: ["fabric"],
        version: "Dec 27, 2021",
        description: `Mod adds independent rotation of the camera from a third person view.

        Completely client-side!
        
        Uses only legal actions to control player rotations.
        `
    },
    {
        name: "Sodium",
        uuid: b,
        category: "Miscellaneous",
        inconpat: new Map(),
        required: new Map(),
        links: [
            { name: "CurseForge", path: "https://www.curseforge.com/minecraft/mc-mods/sodium"}
        ],
        media: {
            icon: "https://media.forgecdn.net/avatars/thumbnails/284/773/64/64/637298471098686391.png",
            background: "https://i.imgur.com/KarVVbr.png",
            list: null
        },
        mc: ["1.18.1","1.17.1"],
        loaders: ["fabric"],
        version: "0.4.0",
        description: `Sodium is a free and open-source rendering engine replacement for the Minecraft client that greatly improves frame rates, reduces micro-stutter, and fixes graphical issues in Minecraft. It boasts wide compatibility with the Fabric mod ecosystem when compared to other mods and doesn't compromise on how the game looks, giving you that authentic block game feel.`
    }
];

export function run(){
    new DB().addMod(mods);
}