import { Box, Typography,  Card, CardContent, CardMedia, Grid, CardActionArea, CircularProgress } from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import {useNavigate} from 'react-router-dom';
import { CategoryList } from "../../core/db";
import { load_content } from "../state/getContent";
import BackgroundImage from "../../images/background2.png"
export default function ContentList(props: { type: "mod" | "profile" | "modpack"}){
    const naviage = useNavigate();
    const [content,setContent] = useState<CategoryList>([]);
    const [isLoading,setIsLoading] = useState<boolean>(true);

    useEffect(()=>{
        load_content(props.type,setContent,setIsLoading);
    },[props.type]);

    if(isLoading) return (
        <Box sx={{ width: "100%", display: "flex", alignContent: "center", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress/>
        </Box>
    );

    return (
        <Box id="content-list">
             <Grid container spacing={1}>
                {content.map((cat,i)=>{
                    return cat.data.map((value,j)=>{
                        return (
                            <Grid item key={`${i}_${j}`} sx={{ display: "flex", justifyContent: "center", alignContent: "stretch", alignItems: "stretch", }}>
                                <Card sx={{ maxWidth: 185, maxHeight: 250 }}>
                                    <CardActionArea sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-start" }} onClick={()=>naviage(`/cdn/${props.type}/${value.uuid}`)}>
                                        <CardMedia height={125} image={value.media.list ?? BackgroundImage} component="img"/>
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
        </Box>
    );
}