import { Accordion, AccordionSummary, AccordionDetails, Typography, Paper, Button, Container, Chip, List, ListItemText, ListItemAvatar, Avatar , ListItem, Card, CardContent, ListItemButton } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {LinkedButton} from '../LinkedButton';
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

export function ModAndPackInfo(props: { incp_mods: any[], req_mods: any[], links: { name: string, link: string }[],  supported_mc: string[], supported_loader: string[]  }){
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
                {props.req_mods.map((mod,i)=>{
                    return (
                        <ListItemButton key={i} component={LinkedButton} to={"/mods/"}>
                            <ListItemAvatar sx={{ minWidth: "30px" }}>
                                <Avatar sx={{ borderRadius: 0, width: 24, height: 24 }}/>
                            </ListItemAvatar>
                            <ListItemText>{mod.name}</ListItemText>
                        </ListItemButton>
                    );
                })}
            </List>
            <Typography>LINKS</Typography>
            <List dense sx={{ padding: 0 }}>
                {props.links.map((link,i)=>{
                    return (
                        <ListItemButton key={i} component="a" href={link.link}>
                            <Typography color="lightblue">{link.name}</Typography>
                        </ListItemButton>
                    );
                })}
            </List>
            <Typography>INCONPADIABLE WITH</Typography>
            <List dense sx={{ padding: 0 }}>
                {props.incp_mods.map((mod,i)=>{
                    return (
                        <ListItemButton key={i} component={LinkedButton} to={"/mods/"}>
                            <ListItemAvatar sx={{ minWidth: "30px" }}>
                                <Avatar sx={{ borderRadius: 0, width: 24, height: 24 }}/>
                            </ListItemAvatar>
                            <ListItemText>{mod.name}</ListItemText>
                        </ListItemButton>
                    );
                })}
            </List>
        </>
    );
}

export function ProfileModContent(props: { mods: any[] }){
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Mods</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <List dense sx={{ padding: 0 }}>
                    { props.mods.map((mod,i)=>{
                        return (
                            <ListItemButton key={i} component={LinkedButton} to="/mods/">
                                <ListItemAvatar sx={{ minWidth: "30px" }}>
                                    <Avatar sx={{ borderRadius: 0, width: 24, height: 24 }}/>
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

export default function ContentInstall(props: { isProfile: boolean }){
    return (
        <div id="content-install">
            <div id="content-install-img" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1641600484661-d55dcebba4d6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1630&q=80")' }}>
                <Typography variant="h6">CONTENT NAME</Typography>
            </div>
            <Paper square elevation={1} id="content-install-actions">
                {
                props.isProfile ? (<>
                    <Button size="small" variant="contained">PLAY</Button>
                    <Button size="small" variant="contained">EDIT</Button>
                    <div id="profile-played">
                        <Typography sx={{ fontSize: 15 }} variant="subtitle1">LAST PLAYED</Typography>
                        <Typography sx={{ fontSize: 12 }} variant="body2" color="gray">{new Date().toDateString()}</Typography>
                    </div>
                </> ): <Button size="small" variant="contained">INSTALL</Button>}
            </Paper>
            <div id="content-install-info">
                <Container id="install-desc">
                    <Card>
                        <CardContent>
                            <Typography>
                                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nihil, perspiciatis, itaque enim perferendis porro similique repellat sed officia quae, placeat ipsa animi est nesciunt tempora architecto dolorum omnis quasi nobis.
                            </Typography>
                        </CardContent>
                    </Card>
                    { props.isProfile ? <ProfileModContent mods={[{name: "MOD NAME"},{name: "MOD NAME 2"}]}/> : null }
                </Container>
                <Paper square elevation={5} id="install-info">
                    { props.isProfile ? <ProfileInfo mc_version="1.18.1" loader="fabric" links={[{name: "GITHUB", path: "https://github.com"}]} /> : <ModAndPackInfo supported_loader={["FABRIC","FORGE"]} supported_mc={["1.18.1","1.17.1"]} links={[{name: "GITHUB", link: "http://github.com"}]} incp_mods={[{name: "OPTIFINE"}]} req_mods={[]}   /> }
                </Paper>
            </div>
        </div>
    );
}