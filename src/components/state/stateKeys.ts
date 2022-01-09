import {atom} from 'recoil';

export const startup_modal = atom({
    key: "STARTUP_MODAL",
    default: false
});

export const game_running = atom({
    key: "MC_IS_RUNNING",
    default: false
});