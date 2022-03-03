import { useQuery, useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import { dialog } from '@tauri-apps/api';
import { useSetRecoilState } from 'recoil';
import { satisfies } from 'semver';
import { toast } from 'react-hot-toast';
import { Box, Container, Button } from '@mui/material';

import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Banner from '../components/view/Banner';
import ModList from '../components/view/ModList';
import SupportVersions from '../components/view/SupportVersions';
import ResourceLinks from '../components/view/ResourceLinks';
import Description from '../components/view/Description';

import { Database, ModRef } from '../lib/db';
import { select_profile } from '../models/SeleteProfile';

import InstallIcon from '@mui/icons-material/InstallDesktop';


export default function ModView() {
    const mutation = useMutation((props: { uuid: string, data: { mods: string[] } })=>Database.profileEdit(props,"update"));
    const { uuid } = useParams();
    const { data, error, isLoading } = useQuery<ModRef,Error>(["ViewMod",uuid],()=>Database.getItem<ModRef>(uuid,"mods"), { enabled: !!uuid });
    const openSelect = useSetRecoilState(select_profile);

    const addMod = async (puuid: string) => {
        const profile = await Database.getItem(puuid,"profiles");

        if(!data?.supports.includes(profile.loader)) {
            await dialog.message(`${data?.name} does not support ${profile.loader}`);
            return; 
        }

        let vaild_version = false;
        for(const version of data.mc) {
           if(satisfies(profile.minecraft,version)) {
                vaild_version = true;
           }
        }
        if(!vaild_version) {
            await dialog.message(`${data?.name} does not support this minecraft version!`);
            return;
        } 

        let incomplate_mod = false;
        for(const mod of data.incompatable) {
            if(profile.mods.includes(mod)) {
                incomplate_mod = true;
            }
        }
        if(incomplate_mod) {
            await dialog.message(`This profile contains a mod that conflicts with ${data?.name}.`);
            return;
        } 

        let required: string[] = [data.uuid];

        for(const mod of data.required) {
            if(!profile.mods.includes(mod)) {
                required.push(mod);
            }
        }

        const added = mutation.mutateAsync({ uuid: profile.uuid, data: { mods: required } });
        await toast.promise(added,{
            error: "Failed to add mod to profile",
            loading: "Adding mod",
            success: "Add Mod to profile"
        });
    }

    if(error) return (<ErrorMessage message={error.message}/>);
    if(isLoading) return (<Loader/>);

    return (
        <Box sx={{ marginBottom: "1rem" }}>
            <Banner name={data?.name} media={data?.media} />
            <Container>
                <Box sx={{ display: "flex", padding: "15px", alignItems: "center" }}>
                    <Button sx={{ color: "#FFFFFF" }} size="medium" variant='contained' startIcon={<InstallIcon/>} onClick={()=>openSelect({ open: true, callback: addMod })}>Install</Button>
                </Box>
                <ResourceLinks links={data?.media.links}/>
                <Description description={data?.description}/>
                <SupportVersions mc={data?.mc} supports={data?.supports}/>
                <ModList uuid={data?.uuid} mods={data?.required} displayName="Required Mods"/>
            </Container>
        </Box>
    );
}