import { Card, CardContent, Box, IconButton, CardMedia, Paper, Typography, LinearProgress, Container } from "@mui/material";
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Download, { DownloadEvent, QueueData} from "../core/downloads";
import { useEffect, useState } from "react";

const downloads = new Download();

export default function Downloads(){
    const [queue,setQueue] = useState<QueueData[]>([]);
    const [queueLength,setQueueLength] = useState<number>(0);
    const [downloadSize,setDownloadSize] = useState<string>("0b");
    const [currentDownloadSize,setCurrentDownloadSize] = useState("0b");
    const [downloadProgress,setDownloadProgress] = useState<number>(0);
    const [downloadTime,setDownloadTime] = useState<string>("00:00");
    const [downloadContent,setDownloadContent] = useState<QueueData | null>(null);
    useEffect(()=>{
        window.addEventListener(DownloadEvent.QUEUE_UPDATE,()=>{
            setQueue(downloads.queue);
            setQueueLength(downloads.queue.length);
        });
        window.addEventListener(DownloadEvent.UPDATE_PROGRESS,(event)=>{
            setDownloadProgress((event as CustomEvent).detail);
        });
        window.addEventListener(DownloadEvent.UPDATE_SIZE,(event)=>{
            setCurrentDownloadSize((event as CustomEvent).detail);
        });
        window.addEventListener(DownloadEvent.UPDATE_TIME,(event)=>{
            setDownloadTime((event as CustomEvent).detail);
        });
        window.addEventListener(DownloadEvent.DOWLOAD_SIZE,(event)=>{
            setDownloadSize((event as CustomEvent).detail);
        });
        window.addEventListener(DownloadEvent.NEXT_START,()=>{
            setQueue(downloads.queue);
            setQueueLength(downloads.queue.length);
            setDownloadContent(downloads.current);
            setDownloadTime("00:00");
            setDownloadProgress(0);
            setCurrentDownloadSize("0b");
            setDownloadSize("0b");
        });
        window.addEventListener(DownloadEvent.DOWNLOADS_FINISH,()=>{
            setDownloadContent(null);
        });
    

        setQueue(downloads.queue);
        setQueueLength(downloads.queue.length);
        setDownloadContent(downloads.current);

        return () => {}
    },[]);

    return (
        <div id="downloads">
            <Paper square elevation={7} id="current-download">
               {
                   downloadContent ? (
                       <>
                            <div id="current-download-name">
                                <img height={60} width={180} src={downloadContent?.media.background ?? ""} alt="download content" />
                                <Typography>{downloadContent?.name ?? "CONTENT NAME"}</Typography>
                            </div>
                            <div id="download-progress">
                                <div id="download-est">
                                    <div id="download-est-mb">
                                        <Typography>{downloadTime}</Typography>
                                        <Typography>DOWNLOADING {downloadProgress}%</Typography>
                                    </div>
                                    <LinearProgress variant="buffer" value={downloadProgress} valueBuffer={downloadProgress}/>
                                    <div id="download-amount">
                                        <Typography>{currentDownloadSize} / {downloadSize} </Typography>
                                    </div>
                                </div>
                                <IconButton>
                                    <PauseIcon/>
                                </IconButton>
                            </div>
                       </>
                   ) : (
                       <Typography sx={{ marginLeft: "10px", marginTop: "10px" }} variant="h4">No Content to download</Typography>
                   )
               }
            </Paper>
            <Container sx={{ display: "flex", flexDirection: "column", marginTop: "10px", gap: "10px", overflowY: "scroll", height: "100%" }}>
                <Typography>UP NEXT ({queueLength})</Typography>
                {queue.map((value,i)=>(
                    <Card key={i} sx={{ display: 'flex' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', width: "100%", justifyContent: "flex-start", marginRight: "5px" }}>
                            <CardContent sx={{ flex: '1 0 auto' }}>
                                <Typography component="div" variant="h5">
                                    {value.name}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" component="div">
                                    {value.mc} - {value.loader.toUpperCase()}
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
                            image={value.media.list ?? ""}
                            alt="Content list image"
                        />
                    </Card>
                ))}
            </Container>
        </div>
    );
}