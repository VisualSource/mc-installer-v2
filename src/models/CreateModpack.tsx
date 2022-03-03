import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem, OutlinedInput } from '@mui/material';
import { atom, useRecoilState } from 'recoil';
import { useQuery, useMutation } from 'react-query';
import { useEffect, useState } from 'react';

import { Database, ICreatableProfile, Loader as ModLoader, Media, type ModpackDef, JVM_ARGS } from '../lib/db';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import toast from 'react-hot-toast';

interface IInstallModpack {
    pack: string | undefined;
    open: boolean;
}

export const install_modpack = atom<IInstallModpack>({
    key: "InstallModpack",
    default: {
        pack: undefined,
        open: false
    }
});

export default function CreateModpack() {
    const [state,setState] = useRecoilState(install_modpack);
    const mutation = useMutation((profile: ICreatableProfile)=>Database.createProfile(profile));
    const { data, error, isLoading } = useQuery(["ViewModpack",state.pack],()=>Database.getItem<ModpackDef>(state.pack,"modpacks"),{ enabled: !!state.pack });
    const [minecraft,setMinecraft] = useState<string | undefined>("");
    const [modloader,setModloader] = useState<ModLoader>("fabric");

    useEffect(()=>{
        setMinecraft(data?.mc[0]);
        setModloader(data?.supports[0] ?? "fabric");
    },[isLoading]);

    const handleClose = () => setState({ pack: undefined, open: false});

    const create = async (): Promise<void> => {

        if(!minecraft || !data ) return;

        const info: ICreatableProfile = {
            name: `${data?.name}-${minecraft}-${modloader}`,
            category: "Modpack",
            dot_minecraft: null,
            java: null,
            jvm_args: JVM_ARGS,
            loader: modloader,
            loader_version: null,
            media: data.media,
            minecraft,
            resolution: null,
            mods: data.mods
        }

        const profile = mutation.mutateAsync(info);
        await toast.promise(profile,{
            success: "Created modpack profile",
            error: "Failed to make profile",
            loading: "Creating profile"
        });
        handleClose();
    }

    return (
        <Dialog open={state.open} onClose={handleClose} scroll="paper" fullWidth>
            <DialogTitle>Install Modpack</DialogTitle>
            <DialogContent>
                {isLoading ? <Loader/> : error ? <ErrorMessage message={(error as Error).message}/> : (
                    <>
                        <FormControl fullWidth sx={{ marginTop: "10px" }}>
                            <InputLabel id="minecraft">Minecraft Version</InputLabel>
                            <Select value={minecraft ?? ""} onChange={(event)=>setMinecraft(event.target.value)} labelId='minecraft' input={<OutlinedInput label="Minecraft Version"/>}>
                                {data?.mc.map((mc: string,i: number)=>(
                                    <MenuItem key={i} value={mc}>{mc}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ marginTop: "10px" }}>
                            <InputLabel id="minecraftloader">ModLoader</InputLabel>
                            <Select value={modloader} onChange={(event)=>setModloader(event.target.value as ModLoader)} labelId='minecraftlodaer' input={<OutlinedInput label="ModLoader"/>}>
                                {data?.supports.map((mc: string,i: number)=>(
                                    <MenuItem key={i} value={mc}>{mc}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button color="error" onClick={handleClose}>Cancel</Button>
                <Button color="success" onClick={create}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}