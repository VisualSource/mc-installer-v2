import { Accordion, AccordionSummary, AccordionDetails, Typography, Paper, Button, Container, Chip, List, ListItemText, ListItemAvatar, Avatar , ListItem, Card, CardContent, ListItemButton } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { startup_modal, game_running, profile_modal, edit_profile_dialog, modpack_install_dialog } from "../state/stateKeys";
import {LinkedButton} from '../LinkedButton';
import { useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import DB, { Loader, Mod } from "../../core/db";
import GetAppIcon from '@mui/icons-material/GetApp';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BackgroundImage from '../../images/background.jpg';
export function ProfileInfo(props: { mc_version: string, loader: string, links: { name: string, path: string }[] }){
    return (
        <>
            <Typography>MC VERSION</Typography>
            <div id="supported-mc-verions">
                <Chip color="success" sx={{ borderRadius: 0 }} label={props.mc_version} size="small"/>
            </div>
            <Typography>LOADER</Typography>
            <div id="supported-loaders">
                <Chip color="success" sx={{ borderRadius: 0 }} label={props.loader.toUpperCase()} size="small"/>
            </div>
            <Typography>LINKS</Typography>
            <List dense sx={{ padding: 0 }}>
                {props.links.map((link,i)=>{
                    return (
                        <ListItemButton key={i} component="a" target="_blank" href={link.path} >
                            <Typography color="lightblue">{link.name}</Typography>
                        </ListItemButton>
                    );
                })}
            </List>
        </>
    );
}

const to_array = (data: Map<Loader,Mod[]>) => {
    const items = [];
    for(const [loader,mods] of data.entries()){
        items.push(
            <ListItem>
                <ListItemText>LOADER: {loader.toUpperCase()}</ListItemText>
            </ListItem>
        );
        for(const mod of mods){
            items.push(
                <ListItemButton key={mod.uuid} component={LinkedButton} to={`/cdn/mod/${mod.uuid}`}>
                    <ListItemAvatar sx={{ minWidth: "30px" }}>
                        <Avatar sx={{ borderRadius: 0, width: 24, height: 24 }} src={mod.media.icon ?? undefined}/>
                    </ListItemAvatar>
                    <ListItemText>{mod.name}</ListItemText>
                </ListItemButton>
            )
        }
    }
    return items;
}

export function ModAndPackInfo(props: { incp_mods: Map<Loader,Mod[]>, req_mods: Map<Loader,Mod[]>, links: { name: string, path: string }[],  supported_mc: string[], supported_loader: string[]  }){
    return (
        <>
            <Typography>SUPPORTED MC VERSIONS</Typography>
             <div id="supported-mc-verions">
                {props.supported_mc.map((mc,i)=>{
                    return (
                        <Chip key={i} color="success" sx={{ borderRadius: 0 }} label={mc} size="small"/>
                    );
                })}
            </div>
            <Typography>SUPPORTED LOADERS</Typography>
            <div id="supported-loaders">
                {props.supported_loader.map((loader,i)=>{
                    return (
                        <Chip key={i} color="success" sx={{ borderRadius: 0 }} label={loader.toUpperCase()} size="small"/>
                    );
                })}
            </div>
            <Typography>REQUIRED MODS</Typography>
            <List dense sx={{ padding: 0 }}>
                {to_array(props.req_mods)}
            </List>
            <Typography>LINKS</Typography>
            <List dense sx={{ padding: 0 }}>
                {props.links.map((link,i)=>{
                    return (
                        <ListItemButton key={i} component="a" target="_blank" href={link.path}>
                            <Typography color="lightblue">{link.name}</Typography>
                        </ListItemButton>
                    );
                })}
            </List>
            <Typography>INCONPADIABLE WITH</Typography>
            <List dense sx={{ padding: 0 }}>
                {to_array(props.incp_mods)}
            </List>
        </>
    );
}

export function ProfileModContent(props: { mods: Mod[] }){
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Mods</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <List dense sx={{ padding: 0 }}>
                    { props.mods.map((mod,i)=> (
                            <ListItemButton key={i} component={LinkedButton} to={`/cdn/mod/${mod.uuid}`}>
                                <ListItemAvatar sx={{ minWidth: "30px" }}>
                                    <Avatar sx={{ borderRadius: 0, width: 24, height: 24 }} src={mod.media.icon ?? undefined}/>
                                </ListItemAvatar>
                                <ListItemText>{mod.name}</ListItemText>
                            </ListItemButton>
                        )
                    )}
                </List>
            </AccordionDetails>
        </Accordion>
    );
}

const defaultContent = {
    name: "UNKNOWN CONTENT",
    links: [],
    description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nihil, perspiciatis, itaque enim perferendis porro similique repellat sed officia quae, placeat ipsa animi est nesciunt tempora architecto dolorum omnis quasi nobis.",
    media: {
        background: BackgroundImage
    },
    mods: [],
    mc: "0.0.0",
    loader: "Vinilla",
    loaders: ["Vinilla"],
    required: new Map(),
    inconpat: new Map(),
    last_played: "Have not played"
}
const get_type = (path: string): string => {
    if(path.includes("modpack")) return "modpack";
    if(path.includes("mod")) return "mod";
    if(path.includes("profile")) return "profile";
    return "unset";
}

const hasModList = (type: string): boolean => {
    return ["modpack","profile"].includes(type);
}

function Actions({type, content}: { content: any, type: "mod" | "modpack" | "profile" | "unset"}){
    const setStartupDialog = useSetRecoilState(startup_modal);
    const setProfileDialog = useSetRecoilState(profile_modal);
    const setEditProfile = useSetRecoilState(edit_profile_dialog);
    const setModpack = useSetRecoilState(modpack_install_dialog);
    const gameRunning = useRecoilValue(game_running);
    switch (type) {
        case "mod":
            return <Button size="small" startIcon={<GetAppIcon/>} variant="contained" onClick={()=>setProfileDialog({show: true, mod: content.uuid})}>INSTALL</Button>;
        case "profile":
            return (
                <>
                    <Button size="small" startIcon={<PlayArrowIcon/>} color={gameRunning ? "warning" : "primary"} variant="contained" onClick={()=>setStartupDialog(true)} disabled={gameRunning}>{ gameRunning ? "PLAYING" : "PLAY" }</Button>
                    <Button size="small" variant="contained" startIcon={<EditIcon/>} onClick={()=>setEditProfile({show: true, profile: content.uuid})}>EDIT</Button>
                    <div id="profile-played">
                        <Typography sx={{ fontSize: 15 }} variant="subtitle1">LAST PLAYED</Typography>
                        <Typography sx={{ fontSize: 12 }} variant="body2" color="gray">{content?.last_played ?? "Have not played"}</Typography>
                    </div>
                </>
            );
        case "modpack":
            return <Button size="small" startIcon={<GetAppIcon/>} variant="contained" onClick={()=>setModpack({show: true, pack: content.uuid})}>INSTALL</Button>;
        default:
            return null;
    }
}

export default function ContentInstall(props: { isProfile: boolean }){
    const {uuid} = useParams();
    const location = useLocation();
    const [content,setContent] = useState<any>(defaultContent);
    const [contentType,setContentType] = useState<"mod" | "modpack" | "profile" | "unset">("unset");
    useEffect(()=>{
        const load = async() => {
            try {
                if(!uuid) throw new Error("Invaild uuid");
                const db = new DB();
                const type = get_type(location.pathname);
                switch(type){
                    case "mod": {
                        const mod = await db.getMod(uuid);
                        if(!mod) throw new Error("Failed to get mod");
                        setContent(mod);
                        setContentType(type);
                        break;
                    }
                    case "modpack": {
                        const modpack = await db.getModPack(uuid);
                        if(!modpack) throw new Error("Failed to get modpack");
                        setContent(modpack);
                        setContentType(type);
                        break;
                    }
                    case "profile": {
                        const profile = await db.getProfile(uuid);
                        if(!profile) throw new Error("Failed to get profile");
                        setContent(profile);
                        setContentType(type);
                        break;
                    }
                    default: 
                        setContent(defaultContent);
                        setContentType("unset");
                        break;
                }
            } catch (error: any) {
                console.warn("Failed to load content for install or was unset");
                setContentType("unset");
                setContent(defaultContent);
            }
        }
        load();
    },[uuid,location]);

    return (
        <div id="content-install">
            <div id="content-install-img" style={{ backgroundImage: `url("${content.media.background ?? defaultContent.media.background}")` }}>
                <Typography variant="h6">{content.name}</Typography>
            </div>
            <Paper square elevation={1} id="content-install-actions">
                <Actions type={contentType} content={content} />
            </Paper>
            <div id="content-install-info">
                <Container id="install-desc">
                    <Card>
                        <CardContent>
                            <Typography>
                               {content.description}
                            </Typography>
                        </CardContent>
                    </Card>
                    { hasModList(contentType) ? <ProfileModContent mods={content.mods ?? []}/> : null }
                </Container>
                <Paper square elevation={5} id="install-info">
                    { props.isProfile ? <ProfileInfo mc_version={content.mc} loader={content.loader} links={content.links} /> : <ModAndPackInfo supported_loader={content.loaders ? content.loaders : [content.loader] } supported_mc={Array.isArray(content.mc) ? content.mc : [content.mc]} links={content.links} incp_mods={content.inconpat ?? defaultContent.inconpat} req_mods={content.required ?? defaultContent.required}   /> }
                </Paper>
            </div>
        </div>
    );
}