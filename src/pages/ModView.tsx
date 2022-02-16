import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

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
    const { uuid } = useParams();
    const { data, error, isLoading } = useQuery<ModRef,Error>(["ViewMod",uuid],()=>Database.getItem<ModRef>(uuid,"mods"), { enabled: !!uuid });
    const openSelect = useSetRecoilState(select_profile);

    if(error) return (<ErrorMessage message={error.message}/>);
    if(isLoading) return (<Loader/>);

    return (
        <Box sx={{ marginBottom: "1rem" }}>
            <Banner name={data?.name} media={data?.media} />
            <Container>
                <Box sx={{ display: "flex", padding: "15px", alignItems: "center" }}>
                    <Button sx={{ color: "#FFFFFF" }} size="medium" variant='contained' startIcon={<InstallIcon/>} onClick={()=>openSelect(true)}>Install</Button>
                </Box>
                <ResourceLinks links={data?.media.links}/>
                <Description description={data?.description}/>
                <SupportVersions mc={data?.mc} supports={data?.supports}/>
                <ModList mods={data?.required} displayName="Required Mods"/>
            </Container>
        </Box>
    );
}