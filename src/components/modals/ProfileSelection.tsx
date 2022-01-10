import {  List, ListItem, Avatar, ListItemAvatar, ListItemText, Dialog, DialogTitle } from "@mui/material";
import { useRecoilState, useSetRecoilState } from "recoil";
import { add_profile_dialog, message_dialog, profile_modal } from "../state/stateKeys";
import AddIcon from '@mui/icons-material/Add';
import DB, { UUID } from "../../core/db";
import { useEffect, useState } from "react";
import { blue } from '@mui/material/colors';
import AppsIcon from '@mui/icons-material/Apps';
import { intersects } from 'semver';

export default function ProfileSelection(){
    const setMessage = useSetRecoilState(message_dialog);
    const setAddProfile = useSetRecoilState(add_profile_dialog);
    const [state,setState] = useRecoilState(profile_modal);
    const handleClose = () => setState({ mod: null, show: false });
    const [profiles,setProfiles] = useState<{ name: string, uuid: string, media: { icon: string | null} }[]>([]);


    useEffect(()=>{
        const load = async () => {
            if(!state.show) return;
            try {
                const db = new DB();;
                const data = await db.profiles.find({ can_edit: true },{_id: 0, description: 0, can_edit: 0, can_delete: 0, category: 0, mc: 0, loader: 0, links: 0, mods: 0}).toArray() as { name: string, uuid: string, media: { icon: string | null} }[];
                setProfiles(data);
            } catch (error) {
                console.error("Failed to get profiles |",error);
            }
        }
        load();
    },[state.show]);

    const handleInstall =  async (profile: string) => {
      try {
        if(!state.mod) return handleClose();
        const db = new DB();
        const pro = await db.getProfile(profile,false);
        const mod = await db.getMod(state.mod,false);
        if(!mod || !pro) return handleClose();

        if((pro.mods as any as UUID[]).includes(mod.uuid)) throw Error("Mod is already installed on this profile");

        const vaildVersion = mod.mc.find(version=>intersects(version,pro.mc));

        if(!vaildVersion) throw new Error("Invaild minecraft version");
        
        const vaildLoader = mod.loaders.find(value=>value===pro.loader);

        if(!vaildLoader) throw new Error("Invaild loader");
        const inconpat = mod.inconpat.get(vaildLoader);
        if(inconpat) {
            for(const invaild of inconpat.values()){
                if((pro.mods as any as UUID[]).includes(invaild as any as UUID)) throw new Error("Inconpatiable mod");
            }
        }

        const required = mod.required.get(vaildLoader);
        if(required){
            for(const req of (required as any as UUID[])) {
                if(!(pro.mods as any as UUID[]).includes(req)){
                    (pro.mods as any as UUID[]).push(req);
                }
            }

            await db.updateProfile(profile,{
                mods: (pro.mods as any as UUID[])
            });
        }

        (pro.mods as any as UUID[]).push(mod.uuid);
        await db.updateProfile(profile,{
            mods: (pro.mods as any as UUID[])
        });

        handleClose();
        setMessage({ msg: `Installed Mod (${mod.name}) to profile (${pro.name})`, title: "Success", show: true });
      } catch (error: any) {
        console.error(error);
        handleClose();
        setMessage({ msg: error.message, title: "Error", show: true });
      }   
    }

    const handleAddProfile = () => {
        handleClose();
        setAddProfile(true);
    }

    return (
        <Dialog open={state.show} onClose={handleClose}>
            <DialogTitle>Select Profile</DialogTitle>
            <List sx={{ pt: 0 }}>
            {profiles.map(profile=>(
                <ListItem button onClick={()=>handleInstall(profile.uuid)} key={profile.uuid}>
                    <ListItemAvatar>
                        <Avatar sx={{ bgcolor: blue[100], color: blue[600] }} src={profile.media.icon ?? undefined}>
                            <AppsIcon/>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={profile.name} />
                </ListItem>
            ))}
            <ListItem autoFocus button onClick={handleAddProfile}>
                <ListItemAvatar>
                    <Avatar sx={{ color: "white" }}>
                      <AddIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="New Profile" />
            </ListItem>
            </List>
        </Dialog>
    );
}