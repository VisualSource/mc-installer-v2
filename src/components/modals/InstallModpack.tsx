import { Box, CircularProgress, Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { nanoid } from "nanoid";
import { useEffect } from "react";

import { useRecoilState, useSetRecoilState } from "recoil";
import DB, { UUID } from "../../core/db";
import { message_dialog, modpack_install_dialog } from "../state/stateKeys";

export default function InstallModpack(){
    const [state,setState] = useRecoilState(modpack_install_dialog);
    const setMessage = useSetRecoilState(message_dialog);
    const handleClose = () => setState({show: false, pack: null});


    useEffect(()=>{
        const init = async()=>{
            if(!state.show) return handleClose();
            try {
                if(!state.pack) throw new Error("Invaild uuid");
                const db = new DB();

                const createdpack = await db.profiles.find({ modpack_uuid: state.pack }).toArray();

                if(createdpack.length > 0) throw new Error("Modpack profile has already been created.");
            
                const pack = await db.getModPack(state.pack,false);

                if(!pack) throw new Error("Failed to fetch modpack data.");

                await db.addProfile({
                    uuid: nanoid(),
                    name: `${pack.name} (${pack.mc})`,
                    mc: pack.mc,
                    loader: pack.loader,
                    mods: (pack.mods as any as UUID[]),
                    description: pack.description,
                    media: pack.media,
                    last_played: null,
                    category: pack.category,
                    can_delete: true,
                    can_edit: false,
                    links: pack.links,
                    modpack_uuid: pack.uuid
                });
                handleClose();
                setMessage({show: true, title: "Success", msg: "Created modpack profile" });
            } catch (error: any) {
                console.error(error);
                handleClose();
                setMessage({show: true, title: "Error", msg: error.message });
            }
        }
        init();
    },[state.pack,state.show]);

    return (
        <Dialog open={state.show}>
            <DialogTitle>Creating modpack profile</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Getting the profile ready!
                </DialogContentText>
                <Box sx={{ marginTop: "10px", height: "100%", width: "100%", display: "flex", justifyContent: "center" }}>
                    <CircularProgress/>
                </Box>
            </DialogContent>
        </Dialog>
    );
}