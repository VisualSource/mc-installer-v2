import { CardContent, Card, CardMedia, Typography, Button, CardActionArea, CardActions, Grid, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, NavigateFunction } from 'react-router-dom';
import Loader from "../components/Loader";
import { Mod } from "../core/Database";

function ModCard({ navigate, mod }: { navigate: NavigateFunction, mod: Mod }){
    return (
        <Grid item xs={4}>
            <Card>
            <CardActionArea onClick={()=>navigate(`/mod/${mod._uuid}`)}>
                <CardMedia component="img" alt="mod preview" image={mod.img} height="140"/>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">{mod.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{mod.desc_short}</Typography>
                </CardContent>
            </CardActionArea>
                <CardActions>
                    <Button onClick={()=>navigate(`/mod/${mod._uuid}`)} size="small" color="primary">View</Button>
                </CardActions>
            </Card>
        </Grid>
    );
}

export default function Mods(){
    const navigate = useNavigate();
    const [mods,setMods] = useState<Mod[]>([]);
    const [isLoading,setIsLoading] = useState(true);

    useEffect(()=>{
        const init = async () => {
            const mods = await window._db.getCollection("mods").find({}).toArray();
            setMods(mods as Mod[]);
            setIsLoading(false);
        }
        init();
    },[]);

    if(isLoading) return <Loader/>;

    return (
        <div id="mods">
            <Box sx={{ flexGrow: 1, padding: "1rem 1rem 1rem 1rem", overflowY: "scroll" }}>
                <Grid container spacing={2}>
                    {mods.map((value,i)=>{
                        return (
                            <ModCard navigate={navigate} key={i} mod={value}/>
                        );
                    })}
                </Grid>
            </Box>
        </div>
    );
}