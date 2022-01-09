import { Accordion, AccordionSummary, AccordionDetails, Typography, Paper, Button, Container, Chip, List, ListItemText, ListItemAvatar, Avatar , ListItem, Card, CardContent, ListItemButton } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRecoilState, useRecoilValue } from 'recoil';
import { startup_modal, game_running } from "../state/stateKeys";
import {LinkedButton} from '../LinkedButton';
import { useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import DB, { Loader, Mod } from "../../core/db";
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
                        <ListItemButton key={i} component="a" href={link.path} >
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
                        <ListItemButton key={i} component="a" href={link.path}>
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
                    { props.mods.map((mod,i)=>{
                        return (
                            <ListItemButton key={i} component={LinkedButton} to={`/cdn/mod/${mod.uuid}`}>
                                <ListItemAvatar sx={{ minWidth: "30px" }}>
                                    <Avatar sx={{ borderRadius: 0, width: 24, height: 24 }} src={mod.media.icon ?? undefined}/>
                                </ListItemAvatar>
                                <ListItemText>{mod.name}</ListItemText>
                            </ListItemButton>
                        );
                    })}
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
        background: "https://images.unsplash.com/photo-1641600484661-d55dcebba4d6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1630&q=80"
    },
    mods: [],
    mc: "0.0.0",
    loader: "Vinilla",
    loaders: ["Vinilla"],
    required: new Map(),
    inconpat: new Map(),
    last_played: "Have not played"
}

export default function ContentInstall(props: { isProfile: boolean }){
    const {uuid} = useParams();
    const location = useLocation();
    const [_show, setShow] = useRecoilState(startup_modal);
    const gameRunning = useRecoilValue(game_running);
    const [content,setContent] = useState<any>(defaultContent);
    const [modList,setModList] = useState(false);
    useEffect(()=>{
        const load = async() => {
            try {
                if(!uuid) return;
                const db = new DB();
                if(location.pathname.includes("modpack")) {
                    const mod = await db.getModPack(uuid);
                    if(mod) setContent(mod); else setContent(defaultContent);
                    setModList(true);
                } else if(location.pathname.includes("mod")){
                    const mod = await db.getMod(uuid);
                    if(mod) setContent(mod); else setContent(defaultContent);
                    setModList(false);
                } else if(location.pathname.includes("profile")) {
                    const mod = await db.getProfile(uuid);
                    if(mod) setContent(mod); else setContent(defaultContent);
                    setModList(true);
                }
            } catch (error: any) {
                console.error("Failed to load content for install");
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
                {
                props.isProfile ? (<>
                    <Button size="small" color={gameRunning ? "warning" : "primary"} variant="contained" onClick={()=>setShow(true)} disabled={gameRunning}>{ gameRunning ? "PLAYING" : "PLAY" }</Button>
                    <Button size="small" variant="contained">EDIT</Button>
                    <div id="profile-played">
                        <Typography sx={{ fontSize: 15 }} variant="subtitle1">LAST PLAYED</Typography>
                        <Typography sx={{ fontSize: 12 }} variant="body2" color="gray">{content?.last_played ?? "Have not played"}</Typography>
                    </div>
                </> ): <Button size="small" variant="contained">INSTALL</Button>}
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
                    { modList ? <ProfileModContent mods={content.mods}/> : null }
                </Container>
                <Paper square elevation={5} id="install-info">
                    { props.isProfile ? <ProfileInfo mc_version={content.mc} loader={content.loader} links={content.links} /> : <ModAndPackInfo supported_loader={content.loaders ? content.loaders : [content.loader] } supported_mc={Array.isArray(content.mc) ? content.mc : [content.mc]} links={content.links} incp_mods={content.inconpat ?? defaultContent.inconpat} req_mods={content.required ?? defaultContent.required}   /> }
                </Paper>
            </div>
        </div>
    );
}