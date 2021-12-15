import { CardContent, Card, CardMedia, Typography, Button, CardActionArea, CardActions, Grid, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, NavigateFunction } from 'react-router-dom';
import Loader from "../components/Loader";
import { Modpack } from "../core/Database";

function ModPack({ navigate, pack }: { navigate: NavigateFunction, pack: Modpack }){
    return (
        <Grid item xs={4}>
            <Card>
            <CardActionArea onClick={()=>navigate(`/modpack/${pack._uuid}`)}>
                <CardMedia component="img" alt="mod preview" image={pack.img} height="140"/>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">{pack.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{pack.desc_short}</Typography>
                </CardContent>
            </CardActionArea>
                <CardActions>
                    <Button onClick={()=>navigate(`/modpack/${pack._uuid}`)} size="small" color="primary">View</Button>
                </CardActions>
            </Card>
        </Grid>
    );
}


export default function Modpacks(){
    const navigate = useNavigate();
    const [modpack,setModpack] = useState<Modpack[]>([]);
    const [isLoading,setIsLoading] = useState(true);

    useEffect(()=>{
        const init = async() => {
            try {
                const data = await window._db.getCollection("modpacks").find({}).toArray();
                setModpack(data as Modpack[]);
                setIsLoading(false);

            } catch (error) {
                console.error(error);
            }
        }
        init();
    },[]);

    if(isLoading) return <Loader/>;

    return (
        <div id="modpacks">
            <Box sx={{ flexGrow: 1, padding: "1rem 1rem 1rem 1rem", overflowY: "scroll" }}>
                <Grid container spacing={2}>
                    {
                        modpack.map((value,i)=>{
                            return (
                                <ModPack pack={value} key={i} navigate={navigate}/>
                            );
                        })
                    }
                </Grid>
            </Box>
        </div>
    );
}