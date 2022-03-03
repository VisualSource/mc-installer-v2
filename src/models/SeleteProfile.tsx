import { atom, useRecoilState, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider } from '@mui/material';

import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';

import { create_profile } from './CreateProfile';
import { fetchList, MinecraftProfile } from '../lib/db';

import FeedIcon from '@mui/icons-material/Feed';
import AddIcon from '@mui/icons-material/Add';

interface IProfileSelect {
    open: boolean;
    callback: (uuid: string) => void
}

export const select_profile = atom<IProfileSelect>({
    key: "SelectProfile",
    default: {
        open: false,
        callback: (uuid: string) => {}
    }
});

export default function SelectProfile(){
    const [state,setOpen] = useRecoilState(select_profile);
    const openCreate = useSetRecoilState(create_profile);
    const { data, error, isLoading } = useQuery<MinecraftProfile[],Error>(["List","profiles"],()=>fetchList("profiles") as Promise<MinecraftProfile[]>);

    const onClose = () => setOpen({ open: false, callback: (uuid)=>{} });
    const event = (uuid: string) => {
       return () => {
            state.callback(uuid);
            onClose();
        }
    }

    return (
        <Dialog open={state.open} onClose={onClose}>
            <DialogTitle>Select Profile</DialogTitle>
            <List sx={{ pt: 0 }}>
                {
                    isLoading ? <Loader/> : error ? <ErrorMessage message="Failed to load profiles"/> : (
                    data?.map((profile,i)=>(
                        <ListItem key={i} autoFocus button onClick={event(profile.uuid)}>
                            <ListItemAvatar>
                                <Avatar src={profile?.media.icon ?? undefined}>
                                    <FeedIcon htmlColor='white' fontSize="small"/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={profile.name} />
                        </ListItem>
                    ))
                )}
                <Divider/>
                <ListItem autoFocus button onClick={()=>{
                    openCreate(true);
                    onClose();
                }}>
                    <ListItemAvatar>
                        <Avatar>
                            <AddIcon htmlColor='white'/>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Create Profile" />
                </ListItem>
            </List>
        </Dialog>
    );
}