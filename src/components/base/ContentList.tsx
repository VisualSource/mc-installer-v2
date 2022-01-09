import { Typography,  Card, CardContent, CardMedia, Grid, CardActionArea } from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import {useNavigate} from 'react-router-dom';
import DB,{ CategoryList } from "../../core/db";
export default function ContentList(props: { type: "mod" | "profile" | "modpack"}){
    const naviage = useNavigate();
    const [content,setContent] = useState<CategoryList>([]);

    useEffect(()=>{
        const load = async() => {
            try {
                const db = new DB();
                switch (props.type) {
                    case "mod": {
                        const mods = await db.getModList();
                        if(mods) setContent(mods); else setContent([]);
                        break;
                    }
                    case "modpack":{
                        const mods = await db.getModpackList();
                        if(mods) setContent(mods); else setContent([]);
                        break;
                    }
                    case "profile":{
                        const mods = await db.getProfileList();
                        if(mods) setContent(mods); else setContent([]);
                        break;
                    }
                    default:
                        setContent([]);
                        break;
                }
            } catch (error: any) {
                console.error(error);
            }
        }
        load();
    },[props.type]);

    return (
        <Grid container spacing={1} id="content-list">
            {content.map((cat,i)=>{
                return cat.data.map((value,j)=>{
                    return (
                        <Grid item key={`${i}_${j}`}>
                            <Card sx={{ maxWidth: 200, maxHeight: 250 }}>
                                <CardActionArea onClick={()=>naviage(`/cdn/${props.type}/${value.uuid}`)}>
                                    <CardMedia height={200} image={value.media.list ?? "https://images.unsplash.com/photo-1641599988873-88139e16581b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"} component="img"/>
                                    <CardContent>
                                        <Typography>{value.name}</Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    );
                });
            }).flat()}
        </Grid>
    );
}