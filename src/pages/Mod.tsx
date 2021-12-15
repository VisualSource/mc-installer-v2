import { Stack, Typography, Grid, Divider, Button, Link, Paper, Dialog, DialogTitle, List, ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import AddIcon from '@mui/icons-material/Add';
import Loader from "../components/Loader";
import type { Mod as IMod } from "../core/Database";
function VersionTag({ version }: { version: string}){
    return (
        <Paper elevation={3} sx={{ backgroundColor: "success.main" }}>
            <Typography sx={{ padding: "5px 5px 5px 5px" }} variant="caption">{version}</Typography>
        </Paper>
    );
}

function LinkTag({ route, text }: { route: string; text: string;}){
    return (
        <Link sx={{ margin: "0 5px 5px 5px"}} href={route} >{text}</Link>
    );
}
export default function Mod(){
    const params = useParams();
    const navigate = useNavigate();
    const [open,setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [modData,setModData] = useState<IMod>();

    const handleClickOpen = () => { setOpen(true); };
    const handleClose = () => { setOpen(false); };

    useEffect(()=>{
        const init = async()=> {
            try {
                setIsLoading(true);
                const mod = await window._db.getCollection("mods").findOne({ _uuid: params["id"] });
                console.log(mod);
                setModData(mod as IMod);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
            }
        }
        init();
    },[params]);

    if(isLoading) return <Loader/>;

    return (
        <Stack direction="column" sx={{ height: "100%" }}>
            <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Select Profile to install to</DialogTitle>
            <List sx={{ pt: 0 }}>
             
                {window._profiles.getAllProfiles().map((value: any, i: number)=>{
                    return (
                    <ListItem button onClick={handleClose} key={i}>
                        <ListItemAvatar>
                            <Avatar>
                                <DoubleArrowIcon htmlColor="white"/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={value.name}/>
                    </ListItem>
                    );
                })}
                <ListItem autoFocus button onClick={handleClose}>
                    <ListItemAvatar>
                        <Avatar>
                            <AddIcon htmlColor="white"/>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Add profile" />
                </ListItem>
            </List>
            </Dialog>
            <Grid container sx={{ height: "100%" }}>
                <Grid item xs={8} sx={{ paddingLeft: "1rem" }}>
                    <br/>
                    <Typography variant="h4">{modData?.name}</Typography>
                    <Divider/>
                    <Stack direction="column">
                        <Stack direction="row" justifyContent="center" sx={{ width: "100%", marginTop: "1.5rem" }}>  
                                <img src={modData?.img} alt="modpack preview" width="200px" height="200px"/>
                        </Stack>
                        <p>{modData?.desc_long}</p>
                        <Button sx={{ marginTop: "1rem" }} color="warning" onClick={()=>navigate("/mods")} variant="contained">Back</Button>
                    </Stack>
                </Grid>
                <Grid item xs={4} sx={{ paddingRight: "0.5rem", paddingLeft: "0.5rem" }}>
                    <Stack direction="column" justifyContent="space-evenly">
                        <Typography sx={{ marginTop: "1rem"}}>Supported Versions</Typography>
                        <Divider/>
                        <Stack sx={{ paddingBottom: "1rem", paddingTop: "1rem" }} direction="row" justifyContent="flex-start" alignContent="flex-start" alignItems="flex-start">
                            {modData?.supported_versions.map((value,i)=>{
                                return (
                                    <VersionTag version={value.version} key={i}/>
                                );
                            })}
                        </Stack>
                        <Typography sx={{ margin: "0.5rem 0 0.5rem 0" }}>Requires</Typography>
                        <Divider/>
                        <Stack sx={{ overflowX: "scroll", paddingBottom: "1rem", paddingTop: "1rem" }} direction="row" alignContent="flex-start" alignItems="flex-start">
                            {
                                modData?.requires?.map((value,i)=>{
                                    return (
                                        <Button key={i} onClick={()=>navigate(`/mod/${value.uuid}`)}>{value.name}</Button>
                                    );
                                })
                            }
                        </Stack>
                        <Typography sx={{ marginTop: "1rem"}}>Links</Typography>
                        <Stack direction="row" sx={{ overflowX: "scroll", paddingBottom: "1rem", paddingTop: "1rem" }}>
                            {
                                modData?.links.map((value,i)=>{
                                    return (
                                        <LinkTag key={i} route={value.url} text={value.name}/>
                                    );
                                })
                            }
                        </Stack>
                        <Button onClick={handleClickOpen} sx={{ marginTop: "2rem" }} variant="contained" color="success">Install</Button>
                    </Stack>
                </Grid>
            </Grid>
        </Stack>
    );
}