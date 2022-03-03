import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from "recoil";

import { Box, Container, Button } from '@mui/material';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Banner from '../components/view/Banner';
import ModList from '../components/view/ModList';
import SupportVersions from '../components/view/SupportVersions';
import ResourceLinks from '../components/view/ResourceLinks';
import Description from '../components/view/Description';

import { Database, ModpackDef } from '../lib/db';
import { install_modpack } from '../models/CreateModpack';

import InstallIcon from '@mui/icons-material/InstallDesktop';

export default function ModpackView() {
    const { uuid } = useParams();
    const { data, error, isLoading } = useQuery<ModpackDef,Error>(["ViewModpack",uuid],()=>Database.getItem<ModpackDef>(uuid,"modpacks"), { enabled: !!uuid });
    const setOpen = useSetRecoilState(install_modpack);


    if(error) return (<ErrorMessage message={error.message}/>);
    if(isLoading) return (<Loader/>);

    return (
        <Box sx={{ marginBottom: "1rem" }}>
            <Banner name={data?.name} media={data?.media} />
            <Container>
                <Box sx={{ display: "flex", padding: "15px", alignItems: "center" }}>
                    <Button onClick={()=>setOpen({ pack: uuid, open: true })} sx={{ color: "#FFFFFF" }} size="medium" variant='contained' startIcon={<InstallIcon/>}>Install</Button>
                </Box>
                <ResourceLinks links={data?.media.links}/>
                <Description description={data?.description}/>
                <SupportVersions mc={data?.mc} supports={data?.supports}/>
                <ModList uuid={data?.uuid} mods={data?.mods}/>
             </Container>
        </Box>
    );
}