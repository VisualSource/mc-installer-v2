import { List, ListItem, ListItemButton, ListItemAvatar, Avatar, IconButton, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import TabPanel, { type ITabProps } from "../../components/TabPanel";

import { Database } from '../../lib/db';
import DeleteIcon from '@mui/icons-material/Delete';
import AppsIcon from '@mui/icons-material/Apps';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

import PackImage from '../../images/pack.webp';

export default function ModsTab({ tab, profile, dispatch }: ITabProps){
    const navigate = useNavigate();
    const { data, isLoading, error } = useQuery(["ModList",profile?.uuid, profile?.mods.length ?? 0],()=>Database.getModList(profile?.mods),{ enabled: !!profile?.uuid });
    return (
        <TabPanel id={3} tab={tab}>
            <List dense>
                { isLoading ? <Loader/> : error ? <ErrorMessage message={JSON.stringify(error)}/> : data?.map((mod,i)=>(
                    <ListItem key={i} secondaryAction={
                        <IconButton edge="end" className="btn-square" onClick={()=>dispatch({ type: "remove_mod", payload: mod.uuid })}> 
                            <DeleteIcon color="error"/> 
                        </IconButton>}>
                        <ListItemButton onClick={()=>navigate(`/view/mods/${mod.uuid}`)}>
                            <ListItemAvatar>
                                <Avatar className="btn-square" src={ mod.media.icon ?? PackImage }>
                                    <AppsIcon htmlColor='white'/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={mod.name}/>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </TabPanel>
    );
}