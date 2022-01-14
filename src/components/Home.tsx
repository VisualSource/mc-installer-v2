import { Container, Grid, Card, CardActionArea, CardContent, CardMedia, Typography, Chip } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import {get_minecraft_news, MinecraftNews } from '../core/cmds';

function NewsCard(item: MinecraftNews) {
    return (
    <Card sx={{ maxWidth: 250 }}>
        <CardActionArea target="_blank" component="a" href={`https://www.minecraft.net${item.article_url}`}>
            <CardMedia component="img" height="140" image={`https://www.minecraft.net${item.default_tile.image.imageURL}`} alt={item.default_tile.image.alt ?? "news"} />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">{item.default_tile.title}</Typography>
                <Typography variant="body2" color="text.secondary">{item.default_tile.sub_header}</Typography>
            </CardContent>
        </CardActionArea>
    </Card>
    );
}


export default function Home(){
    const [content, setContent] = useState<MinecraftNews[]>([]);
    const [loading,setLoading] = useState<boolean>(true);

    useEffect(()=>{
        const load = async () => {
            try {
                let items = await get_minecraft_news();
                setContent(items);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setContent([]);
                setLoading(false);
            }
        }
        load();
    },[]);

    if (loading) {
        return (
            <Container>
                Loading
            </Container>
        )
    }

    return (
        <Container id="app-home">
            <Typography sx={{ marginTop: "15px" }} variant="h3">Minecraft News and Guides</Typography>
            <Box id="app-home-news" sx={{ marginTop: "1em", marginBottom: "1em" }}>
                <Grid container sx={{ height: "100%", gap: "0.5em", marginTop: "20px", marginBottom: "20px" }}>
                    {content.map((card,i)=>(
                        <Grid item sx={{ gap: "0.5em", display: "flex", alignContent: "stretch", alignItems: "stretch", maxHeight: "325px" }}>
                            <NewsCard key={i} {...card} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
}