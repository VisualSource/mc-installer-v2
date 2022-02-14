import { atom } from 'recoil';

interface SelectedProfile {
    name: string | undefined;
    uuid: string | undefined;
}

export const default_profile = atom<SelectedProfile>({
    key: "default_profile",
    default: {
        name: "Forge 1.18.1",
        uuid: "AE##F#@FADF@#"
    }
}); 