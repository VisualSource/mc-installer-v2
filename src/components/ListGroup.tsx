import { useParams, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import { CardMedia, Grid , Card, CardActionArea, Container, Typography, Button } from '@mui/material';

import { fetchList } from '../lib/db';
import { create_profile } from '../models/CreateProfileDialog';


import AddIcon from '@mui/icons-material/Add';

export function ListGroup() {
    const openCreateProfile = useSetRecoilState(create_profile);
    const params = useParams();
    const navigate = useNavigate();
    const { data, error, isLoading } = useQuery<any,Error>(["List",params.type],()=>fetchList(params.type as any), { enabled: !!params.type });

    if(isLoading) return (<Loader/>);
    if(error) return (<ErrorMessage message={error.message}/>);

    if([].length === 0) {
        return (
            <Container sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", alignContent: "center" }}>
                <Typography>Looks like theres nothing to show here!</Typography>
               {params.type === "profiles" ? <Button onClick={()=>openCreateProfile(true)} sx={{ marginTop: "1rem" }} variant='contained' color="success" startIcon={<AddIcon/>}>Create A profile</Button> : null }
            </Container>
        );
    }

    return (
        <Grid container spacing={1} id="vs-image-list">
            {data.map((value: any, i: number)=>{
                return (
                    <Grid item key={i} id="vs-image-list-grid">
                        <Card className="vs-image-item" sx={{ width: "150px", height: "150px" }}>
                            <CardActionArea onClick={()=>navigate(`/view/${params.type}/${value.uuid}`)}>
                                <CardMedia component="img" image={value.media?.banner ?? `https://via.placeholder.com/600/${value.name}`} />
                            </CardActionArea>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}