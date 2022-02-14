import { useQuery } from "react-query";
import { CardMedia, Grid , Card, Button, CardActions, Typography, CardContent } from '@mui/material';
import Loader from '../components/Loader';
import ErrorMessage from "../components/ErrorMessage";
import { get_minecraft_news } from '../lib/commands';

function NewsCard({ article }: { article: any }) {
    return (
        <Card className="news-card">
            <CardMedia height="140" component="img" image={`https://www.minecraft.net${article?.preferred_tile?.image?.imageURL ?? article.default_tile.image.imageURL}`} alt={article?.preferred_tile?.image?.alt ?? article.default_tile.image.alt}/>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {article?.preferred_tile?.title ?? article.default_tile.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {article?.preferred_tile?.sub_header ?? article.default_tile.sub_header}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" href={`https://www.minecraft.net${article.article_url}`} target="_blank">View</Button>
            </CardActions>
        </Card>
    );
}


export default function Home(){
    const {isLoading, error, data } = useQuery<any,Error>("minecraftNews",()=>get_minecraft_news());

    if(isLoading) return (<Loader/>);

    if(error) return (<ErrorMessage message={error.message} />)

    return (
        <Grid id="vs-article-grid" container spacing={3}>
            {data.article_grid.map((article: any, i: number)=>{
                return (
                    <Grid item key={i}>
                        <NewsCard article={article}/>
                    </Grid>
                );
            })}
        </Grid>
    );
}