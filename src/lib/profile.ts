import { atom } from 'recoil';

interface SelectedProfile {
    name: string | undefined;
    uuid: string | undefined;
}

function loadDefault(){
    const data = localStorage.getItem("default_profile");
    if(!data) {
        return {
            name: undefined,
            uuid: undefined
        }
    }

    return JSON.parse(data);
}

export const default_profile = atom<SelectedProfile>({
    key: "default_profile",
    default: loadDefault(),
    effects_UNSTABLE: [
        ({ onSet }) => {
            onSet(value=>{
                if(!value?.uuid) {
                    localStorage.removeItem("default_profile");
                } else {
                    localStorage.setItem("default_profile",JSON.stringify(value))
                }
            });
        }
    ]
}); 