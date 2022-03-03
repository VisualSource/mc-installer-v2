import { FormControl, TextField, Select, MenuItem, InputLabel, OutlinedInput } from '@mui/material';
import { useMutation, useQuery } from 'react-query';

import TabPanel, { type ITabProps } from "../../components/TabPanel";
import { get_versions } from '../../lib/commands';



export default function GeneralTab({ tab, profile, dispatch }: ITabProps){
    const minecraftVersions = useQuery(["mc_versions",profile?.loader], () => get_versions(profile?.loader ?? "vanilla"), { enabled: !!profile?.loader });

    return ( 
        <TabPanel id={0} tab={tab}>
            <FormControl fullWidth>
                <TextField name="name" onChange={(event)=>dispatch({ type: "set_name", payload: event.target.value })} value={profile?.name} label="Name"/>
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "10px" }}>
                <TextField name="category" onChange={(event)=>dispatch({ type: "set_category", payload: event.target.value })} value={profile?.category} label="Category"/>
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "10px" }}>
                <InputLabel id="modloader-label">ModLoader</InputLabel>
                <Select name="loader" onChange={(event)=>dispatch({ type: "set_modloader", payload: event.target.value })} value={profile?.loader} labelId="modloader-label" id="modloader" input={<OutlinedInput label="ModLoader" />}>
                    <MenuItem value="vanilla">Vanilla</MenuItem>
                    <MenuItem value="optifine">OptiFine</MenuItem>
                    <MenuItem value="forge">Forge</MenuItem>
                    <MenuItem value="fabric">Fabric</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "10px" }}>
                <InputLabel id="minecraft-version-label">Minecraft</InputLabel>
                <Select input={<OutlinedInput label="Minecraft" />} name="minecraft" value={profile?.minecraft} onChange={(event)=>dispatch({ type: "set_minecraft_version", payload: event.target.value })}  labelId='minecraft-version-label' id="minecraft-version">
                    <MenuItem value="latest-release">Latest Release</MenuItem>
                    {minecraftVersions.isLoading ? (
                        <MenuItem disabled>Loading</MenuItem>
                    ) : minecraftVersions.error ? (
                        <MenuItem disabled>Failed to load</MenuItem>
                    ) : minecraftVersions?.data?.map((item: string ,i: number)=>(
                        <MenuItem key={i} value={item}>{item}</MenuItem>
                    )) }
                </Select>
            </FormControl>
        </TabPanel>
    )
}