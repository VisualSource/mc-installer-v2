import { Box, Typography, List, Paper, ListItemButton, Avatar, ListItemAvatar, ListItemText } from '@mui/material';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import AppsIcon from "@mui/icons-material/Apps";

import { Database } from '../../lib/db';
import Loader from '../Loader';
import ErrorMessage from '../ErrorMessage';


export default function ModList({ uuid, mods, displayName = "Mod List" }: {  uuid: string | undefined, displayName?: string, mods: any[] | undefined }){
    const navigate = useNavigate();
    const { data, isLoading, error } = useQuery(["ModList",uuid],()=>Database.getModList(mods),{ enabled: !!uuid });
    return (
        <Box sx={{ marginTop: "1rem" }}>
            <Typography variant='h5'>{displayName}</Typography>
                <Paper elevation={3}>
                    <Box sx={{ paddingLeft: "5px", paddingBottom: "10px" }}>
                        <details className="modlist">
                            <summary>View</summary>
                            <List dense>
                                {isLoading ? <Loader/> : error ? <ErrorMessage message={(error as Error).message}/> : data?.map((mod,i)=>(
                                    <ListItemButton key={i} onClick={()=>navigate(`/view/mods/${mod.uuid}`)}>
                                        <ListItemAvatar>
                                            <Avatar className="btn-square" sx={{ width: "28px", height: "28px"  }} src={mod.media?.icon ?? undefined}>
                                                <AppsIcon htmlColor='white'/>
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={mod?.name ?? "Unnamed Mod"}/>
                                    </ListItemButton>
                                ))}
                            </List>
                        </details>
                    </Box>
            </Paper>
        </Box>
    );
}