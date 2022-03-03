import { atom, useRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { useState, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogTitle, DialogActions, DialogContent, Button, Box, Tab, Tabs } from '@mui/material';

import { type MinecraftProfile, Database } from '../../lib/db';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

import GeneralTab from './GeneralTab';
import AdvancedTab from './AdvancedTab';
import MediaTab from './MediaTab';
import ModsTab from './ModsTab';
import OtherTab from './OtherTab';

interface ProfileSettings {
    open: boolean;
    profile: string | undefined;
}

interface EditableProfileState {
    data: MinecraftProfile | undefined;
    error: Error | null;
    isLoading: boolean;
}

export const settings_profile = atom<ProfileSettings>({
    key: "edit_profile_settings",
    default: {
        open: false,
        profile: ""
    }
});

const editProfileReducer = (state: EditableProfileState, action: { type: string, payload: any }): EditableProfileState => {
    switch (action.type) {
        case "load_start": {
            return { isLoading: true, data: undefined, error: null };
        }
        case "load_end_success": {
            return { isLoading: false, data: action.payload, error: null };
        }
        case "load_end_error": {
            return { isLoading: false, data: undefined, error: action.payload };
        }
        case "set_minecraft_version": {
            if(state.data) state.data.minecraft = action.payload;
            return { ...state };
        }
        case "set_modloader": {
            if(state.data) state.data.loader = action.payload;
            return { ...state };
        }
        case "set_name": {
            if(state.data) state.data.name = action.payload;
            return { ...state };
        }
        case "set_category": {
            if(state.data) state.data.category = action.payload;
            return { ...state };
        }
        case "set_java": {
            if(state.data) state.data.java = action.payload;
            return {...state};
        }
        case "set_game_dir": {
            if(state.data) state.data.dot_minecraft = action.payload;
            return {...state};
        }
        case "set_jvm_args":{
            if(state.data) state.data.jvm_args = action.payload;
            return {...state};
        }
        case "set_loader_version": {
            if(state.data) state.data.loader_version = action.payload;
            return {...state};
        }
        case "set_resolution_width":{
            if(state.data) {
                if(state.data.resolution) {
                    state.data.resolution.width = action.payload;
                } else {
                    state.data.resolution = { width: action.payload, height: 480 };
                }
            }
            return {...state};
        }
        case "set_resolution_height":{
            if(state.data) {
                if(state.data.resolution) {
                    state.data.resolution.height = action.payload;
                } else {
                    state.data.resolution = { height: action.payload, width: 854 };
                }
            }
            return {...state};
        }
        case "set_icon": {
            if(state.data) state.data.media.icon = action.payload;
            return {...state};
        }
        case "set_banner": {
            if(state.data) state.data.media.banner = action.payload;
            return {...state};
        }
        case "set_card": {
            if(state.data) state.data.media.card = action.payload;
            return {...state};
        }
        case "add_link": {
            if(state.data) {
                state.data.media.links.push(action.payload);
            }
            return {...state};
        }
        case "remove_link": {
            if(state.data) {
                state.data.media.links = state.data.media.links.filter((_link,i)=> i !== action.payload);
            }
            return {...state};
        }
        case "remove_mod":{
            if(state.data) {
                state.data.mods = state.data.mods.filter(mod => mod !== action.payload);
            }
            return {...state};
        }
        default:
            return state;
    }
}

export default function ProfileEditDialog() { 
    const mutation = useMutation((props: { uuid: string | undefined, data: any })=>{
        if(!props.uuid) throw new Error("Invaild UUID");
        return Database.profileEdit({ uuid: props.uuid, data: props.data },"update");
    }, { onSuccess: data => {} });
    const [state, setState] = useRecoilState(settings_profile);
    const [{ data, error, isLoading },dispatch] = useReducer(editProfileReducer, { data: undefined, error: null, isLoading: true });
    const [tab, setTab] = useState<number>(0);

    useEffect(()=>{
        const init = async () => {
            try {
                dispatch({ type: "load_start", payload: true });
                const data = await Database.getItem(state.profile);
                dispatch({ type: "load_end_success", payload: data });
            } catch (error) {
                dispatch({ type: "load_end_error", payload: error });
            }
        }
        init();
    },[state.profile]);

    const changeTab = (_event: React.SyntheticEvent, value: number) => setTab(value);
    const handleClose = () => setState({ ...state, open: false });
    const submit = async () => {
        const updateFn = mutation.mutateAsync({ uuid: state.profile, data: data });
        await toast.promise(updateFn , {
            error: "Failed to update profile",
            loading: "Updating profile",
            success: "Updated profile"
        });
        handleClose();
    }

    return (
        <Dialog open={state.open} onClose={handleClose} scroll="paper" fullWidth>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tab} onChange={changeTab}>
                        <Tab label="General"/>
                        <Tab label="Advanced"/>
                        <Tab label="Media"/>
                        <Tab label="Mods"/>
                        <Tab label="Other"/>
                    </Tabs>
                </Box>
                {isLoading ? <Loader/> : error ? <ErrorMessage message={error.message} /> : (
                <>
                    <GeneralTab tab={tab} profile={data} dispatch={dispatch}/>
                    <AdvancedTab tab={tab} profile={data} dispatch={dispatch}/>
                    <MediaTab tab={tab} profile={data} dispatch={dispatch}/>
                    <ModsTab tab={tab} profile={data} dispatch={dispatch}/>
                    <OtherTab tab={tab} profile={data} dispatch={dispatch} closeHandle={handleClose}/>
                </>
                )}
            </DialogContent>
            <DialogActions>
                <Button color="error" onClick={handleClose}>Cancel</Button>
                <Button color="success" onClick={submit}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}