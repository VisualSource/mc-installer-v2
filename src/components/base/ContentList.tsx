import { Typography,  Card, CardContent, CardMedia, Grid, CardActionArea } from "@mui/material";
import {useNavigate} from 'react-router-dom';
export default function ContentList(props: { type: "mod" | "profile" | "modpack"}){
    const naviage = useNavigate();
    return (
        <Grid container spacing={1} id="content-list">
            {Array.from(Array(25)).map((_,i)=>{
                return (
                    <Grid item key={i}>
                        <Card sx={{ maxWidth: 200, maxHeight: 250 }}>
                            <CardActionArea onClick={()=>naviage(`/${props.type}/CONTENT_ID`)}>
                                <CardMedia height={200} image="https://images.unsplash.com/photo-1641599988873-88139e16581b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" component="img"/>
                                <CardContent>
                                    <Typography>{props.type.toUpperCase()} NAME {i}</Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}