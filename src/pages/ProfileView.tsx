import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { Box, Paper, Button, Container, Typography, IconButton, List, ListItem, ListItemText, Tooltip } from '@mui/material';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Banner from '../components/view/Banner';
import ModList from '../components/view/ModList';
import ResourceLinks from '../components/view/ResourceLinks';
import { getItem, MinecraftProfile } from '../lib/db';

import { default_profile } from '../lib/profile';
import { settings_profile } from '../models/ProfileSettingsDialog';
import StartIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import StarIcon from '@mui/icons-material/Star';


export default function ProfileView() {
    const { uuid } = useParams();
    const { data, error, isLoading } = useQuery<MinecraftProfile,Error>(["ViewProfile",uuid],()=>getItem("profiles", uuid as string) as Promise<MinecraftProfile>, { enabled: !!uuid });
    const [ defaultProfile, setDefaultProfile] = useRecoilState(default_profile);
    const setEditProfile = useSetRecoilState(settings_profile);

    if(error) return (<ErrorMessage message={error.message}/>);
    if(isLoading) return (<Loader/>);

    return (
        <Box sx={{ marginBottom: "1rem" }}>
            <Banner name={data?.name} media={data?.media} />
            <Container>
                <Box sx={{ display: "flex", padding: "15px", alignItems: "center" }}>
                    <Button sx={{ color: "#FFFFFF" }} size="medium" variant='contained' color="success" startIcon={<StartIcon/>}>Play</Button>
                    <Box sx={{ marginLeft: "10px" }}>
                        <Typography variant='h6'>Last Played</Typography>
                        <Typography variant="subtitle2" color="lightgrey">{ data?.last_used ?? "Never played"}</Typography>
                    </Box>
                    <Tooltip title="Settings" sx={{ marginLeft: "auto" }}>
                        <IconButton onClick={()=>setEditProfile({ open: true, profile: data?.uuid })} className="btn-square">
                            <SettingsIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Set as default">
                        <IconButton sx={{ color: defaultProfile.uuid === data?.uuid ? "#eadf12" : "#FFFFFF" }} className="btn-square" onClick={()=>setDefaultProfile({ name: data?.name, uuid: data?.uuid })}>
                            <StarIcon/>
                        </IconButton>
                    </Tooltip>
                </Box>
                <ResourceLinks links={data?.media.links}/>
                <Box sx={{ marginTop: "1rem" }}>
                    <Box>
                        <Typography variant='h5'>Info</Typography>
                        <Paper elevation={3}>
                            <List dense>
                                <ListItem>
                                    <ListItemText>
                                        Minecraft: <Box sx={{ display: "inline", color: "#06a006" }}>{data?.minecraft ?? "Unknown"}</Box>
                                    </ListItemText>
                                </ListItem>
                                <ListItem>
                                    <ListItemText>
                                        ModLoader: <Box sx={{ display: "inline" }} className={`loader-${data?.loader}`}>{data?.loader ?? "Unknown"}</Box>
                                    </ListItemText>
                                </ListItem>
                                <ListItem>
                                    <ListItemText>
                                        Modloader Version: <Box sx={{ display: "inline", color: "GrayText" }}>{data?.loader_version ?? "Unknown"}</Box>
                                    </ListItemText>
                                </ListItem>
                                <ListItem>
                                    <ListItemText>
                                    Created:  <Box sx={{ display: "inline", color: "lightgrey" }}>{data?.created ?? "Unknown"}</Box>
                                    </ListItemText>
                                </ListItem>
                            </List>
                        </Paper>
                    </Box>
                    <ModList mods={data?.mods}/>
                </Box>
            </Container>
        </Box>
    );
}