import { Switch, FormControlLabel, Typography, Container, Box, Divider, Button} from '@mui/material';
import { app } from '@tauri-apps/api';
import { useEffect, useState } from 'react';

interface ISettings {
    cache_mods: boolean;
    cache_installers: boolean;
    close_launcher: boolean;
}

export default function Settings() {
    const [settings,setSettings] = useState<ISettings>({ cache_mods: false, cache_installers: true, close_launcher: true });
    const [appData,setAppData] = useState<{ version: string, name: string, tauri: string }>({ version: "", name: "", tauri: "" });

    useEffect(()=>{
        const data = localStorage.getItem("settings");
        if(!data) {
            localStorage.setItem("settings",JSON.stringify(settings));
            return;
        }
        setSettings(JSON.parse(data));
        const init = async () =>{
            let data = await Promise.all([ app.getName(), app.getVersion(), app.getTauriVersion() ]);
            setAppData(()=>({
                name: data[0],
                version: data[1],
                tauri: data[2]
            }));
        }
        init();
    },[]);

    const save = (key: string, value: boolean) => {
        const data: { [key: string]: boolean } = {...settings};
        data[key] = value;

        setSettings(()=>{
            localStorage.setItem("settings",JSON.stringify(data))
            return data as any as ISettings;
        });
    };

    return (
        <Container>
            <Box sx={{ marginTop: "1rem" }}>
                <Typography variant="h4">Settings</Typography>
                <Divider/>
            </Box>
            <Box sx={{ marginTop: "1rem", display: "flex", flexDirection: "column" }}>
                <FormControlLabel control={<Switch onChange={(event)=>{ save("cache_mods",event.target.checked); }} checked={settings?.cache_mods} />} label="Cache Mods" />
                <FormControlLabel control={<Switch onChange={(event)=>{ save("cache_installers",event.target.checked); }} checked={settings?.cache_installers}/>} label="Cache Installers" />
                <FormControlLabel control={<Switch onChange={(event)=>{ save("close_launcher",event.target.checked);}} checked={settings?.close_launcher}/>} label="Close Launcher on game start" />
            </Box>
            <Box sx={{ marginTop: "1rem" , marginBottom: "1rem" }}>
                <Typography variant="h4">App Info</Typography>
                <Divider/>
            </Box>
            <Typography>{appData.name}: {appData.version}</Typography>
            <Typography>Tauri: {appData.tauri}</Typography>
            <Button sx={{ marginTop: "1rem" }} variant='contained' size="small" href="https://visualsource.us/report">Report an issuse</Button>
        </Container>
    );
}