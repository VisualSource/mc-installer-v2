import { FormControl, TextField, Select, MenuItem, InputLabel, OutlinedInput, Typography, Box } from '@mui/material';
import { useQuery } from 'react-query';
import { dialog } from '@tauri-apps/api';
import TabPanel, { type ITabProps } from "../../components/TabPanel";
import PickFile from '../../components/PickFile';

import { get_loader_versions } from '../../lib/commands';


export default function AdvancedTab({ tab, profile, dispatch }: ITabProps) {
    const { isLoading, error, data } = useQuery(
        ["loader_versions",profile?.minecraft,profile?.loader], 
        () => get_loader_versions(profile?.loader ?? "vanilla",profile?.minecraft ?? "0.0.0"), 
        { enabled: ((!!profile?.loader) && (!!profile?.minecraft)) } 
    );

    const setJava = async () => {
        const window = await dialog.open({ multiple: false, filters: [{ extensions: ["exe"], name: "Application" }] });
        dispatch({ type: "set_java", payload: window });
    }

    const setGameDir = async () => {
        const window = await dialog.open({ multiple: false, directory: true });
        dispatch({ type: "set_game_dir", payload: window });
    }

    return (
        <TabPanel id={1} tab={tab}>
            <FormControl fullWidth>
                <TextField onChange={(event)=>dispatch({ type: "set_jvm_args", payload: event.target.value })} value={profile?.jvm_args} name="jvm_args" label="JVM Arguments"/>
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "10px" }}>
                <InputLabel id="modloader-version">ModLoader Version</InputLabel>
                <Select onChange={(event)=>dispatch({ type: "set_loader_version", payload: event.target.value })} value={profile?.loader_version} labelId='modloader-version' input={<OutlinedInput label="ModLoader Version"/>}>
                    <MenuItem value="latest-release">Latest Release</MenuItem>
                    {isLoading ? (
                        <MenuItem>Loading</MenuItem>
                    ) : error ? (
                        <MenuItem>Loading Error</MenuItem>
                    ) : data?.map((value,i)=>(
                        <MenuItem value={value} key={i}>{value}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl sx={{ marginTop: "10px" }}>
                <Typography>Screen resolution</Typography>
                <Box sx={{ marginTop: "10px", width: "100%", display: "flex" }}>
                    <TextField onChange={(event)=>dispatch({ type: "set_resolution_width", payload: (event.target as HTMLInputElement).valueAsNumber })} value={ profile?.resolution?.width ?? 854 } fullWidth InputLabelProps={{ shrink: true }} type="number" label="Width" />
                    <TextField onChange={(event)=>dispatch({ type: "set_resolution_height", payload: (event.target as HTMLInputElement).valueAsNumber })} value={ profile?.resolution?.height ?? 480 } fullWidth InputLabelProps={{ shrink: true }} type="number" label="Height"/>
                </Box>
            </FormControl>
            <PickFile sx={{ marginTop: "10px" }} label="Game Dir" clickEvent={setGameDir} defaultValue={profile?.dot_minecraft ?? ".minecraft"} btnText="Open Dir"/>
            <PickFile sx={{ marginTop: "10px" }} label="Java Exec" clickEvent={setJava} defaultValue={profile?.java ?? "Bundled Runtime"}/>
        </TabPanel>
    );
}