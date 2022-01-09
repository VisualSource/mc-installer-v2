import { Card, CardContent, Box, IconButton, CardMedia, Paper, Typography, LinearProgress, Button, Container } from "@mui/material";
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
export default function Downloads(){

    return (
        <div id="downloads">
            <Paper square elevation={7} id="current-download">
                <div id="current-download-name">
                    <img height={60} width={180} src="https://images.unsplash.com/photo-1641579281152-e5d633aa3775?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80" alt="" />
                    <Typography>CONTENT NAME</Typography>
                </div>
                <div id="download-progress">
                    <div id="download-est">
                        <div id="download-est-mb">
                            <Typography>{"06:25"}</Typography>
                            <Typography>DOWNLOADING {45}%</Typography>
                        </div>
                        <LinearProgress variant="buffer" value={10} valueBuffer={10}/>
                        <div id="download-amount">
                            <Typography>{"500MB"} / {"1.8GB"} </Typography>
                        </div>
                    </div>
                    <IconButton>
                        <PauseIcon/>
                    </IconButton>
                </div>
            </Paper>
            <Container sx={{ display: "flex", flexDirection: "column", marginTop: "10px", gap: "10px", overflowY: "scroll", height: "100%" }}>
                <Typography>UP NEXT (34)</Typography>
                 <Card sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', width: "100%", justifyContent: "flex-start", marginRight: "5px" }}>
                        <CardContent sx={{ flex: '1 0 auto' }}>
                            <Typography component="div" variant="h5">
                                MOD NAME
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" component="div">
                                1.18.1 - FABRIC
                            </Typography>
                        </CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: "center" }}>
                            <IconButton aria-label="play/pause">
                                <PlayArrowIcon sx={{ height: 38, width: 38 }} />
                            </IconButton>
                        </Box>
                    </Box>
                    <CardMedia
                        component="img"
                        sx={{ width: 151, maxHeight: 100 }}
                        image="https://images.unsplash.com/photo-1593642532744-d377ab507dc8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxMzJ8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
                        alt="Live from space album cover"
                    />
                </Card>
            </Container>
        </div>
    );
}