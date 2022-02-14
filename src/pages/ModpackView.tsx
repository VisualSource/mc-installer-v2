import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

import { Box, Container, Button } from '@mui/material';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Banner from '../components/view/Banner';
import ModList from '../components/view/ModList';
import SupportVersions from '../components/view/SupportVersions';
import ResourceLinks from '../components/view/ResourceLinks';
import Description from '../components/view/Description';

import { getItem, ModpackDef } from '../lib/db';

import InstallIcon from '@mui/icons-material/InstallDesktop';

export default function ModpackView() {
    const { uuid } = useParams();
    const { data, error, isLoading } = useQuery<ModpackDef,Error>(["ViewModpack",uuid],()=>getItem("modpacks", uuid as string) as Promise<ModpackDef>, { enabled: !!uuid });

    if(error) return (<ErrorMessage message={error.message}/>);
    if(isLoading) return (<Loader/>);

    return (
        <Box sx={{ marginBottom: "1rem" }}>
            <Banner name={data?.name} media={data?.media} />
            <Container>
                <Box sx={{ display: "flex", padding: "15px", alignItems: "center" }}>
                    <Button sx={{ color: "#FFFFFF" }} size="medium" variant='contained' startIcon={<InstallIcon/>}>Install</Button>
                </Box>
                <ResourceLinks links={data?.media.links}/>
                <Description description={data?.description}/>
                <SupportVersions mc={data?.mc} supports={data?.supports}/>
                <ModList mods={data?.mods}/>
             </Container>
        </Box>
    );
}