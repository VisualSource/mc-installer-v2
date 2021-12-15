import { Typography, List, ListItem, Box, Divider, Stack, Button, IconButton, LinearProgress, Tooltip, Paper, Container } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import Loader from '../components/Loader';

function DownloadItem({btnPropt = "update now", itemName = "Content Name", itemImg = "https://via.placeholder.com/120x80"}: {itemImg?: string, btnPropt?: string, itemName?: string}){
    return (
    <ListItem>
        <Paper elevation={5} sx={{ width: "100%", padding: "5px 15px 5px 15px" }}>
            <Stack direction="row" justifyContent="space-between" width="100%" alignContent="center" alignItems="center">
                <Stack direction="row" alignContent="center" alignItems="center">
                    <Box sx={{ marginRight: "5px" }}>
                        <img src={itemImg} alt="downloadable content" />
                    </Box>
                    <Typography color="text.primary" variant="h6">{itemName}</Typography>
                </Stack>
                <Button color="success" variant="contained">{btnPropt}</Button>
            </Stack>
        </Paper>
    </ListItem>         
    );
}

function CurrentDownload({ noDownloads = true }: { noDownloads?: boolean }){
    const [content,setContent] = useState({ img: "", name: "" });
    const [time,setTime] = useState("99:99::99");
    const [progress,setProgress] = useState(0);
    const [totalSize,setTotalSize] = useState("0 b");
    const [currentSize,setCurrentSize] = useState("0 b");

    useEffect(()=>{
        setTotalSize(window._downloads.currentDownload?.totalSize ?? "0 b");
        setContent(window._downloads.currentDownload?.item ?? { img: "", name: "" });
        setTime(window._downloads.currentDownload?.remaning_time ?? "99:99::99");
        setProgress(window._downloads.currentDownload?.progress ?? 0);
        setCurrentSize(window._downloads.currentDownload?.currentSize ?? "0 b");
    },[]);

    if(noDownloads){
        return (
            <Container>
                <Typography color="text.secondary">There are no downloads in the queue</Typography>
            </Container>
        );
    }
    return (
        <>
                <Stack direction="row" justifyContent="center" alignContent="center" alignItems="center" sx={{ marginLeft: "0.4rem" }}>
                    <Box sx={{ padding: "5px", "> img": { height: "80px", width: "120px" } }}>
                        <img src={content.img} alt="downloadable content" />
                    </Box>
                    <Typography color="text.primary" variant="h6">{content.name}</Typography>
                </Stack>
                <Stack direction="row" sx={{ width: "40%"}}>
                    <Stack direction="column" sx={{ width: "100%"}}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography color="text.secondary" variant="caption">{time}</Typography>
                            <Typography color="text.secondary" variant="body2" sx={{ textTransform: "uppercase"}}>{progress}%</Typography>
                        </Stack>
                        <LinearProgress variant="buffer" valueBuffer={0} value={progress}/>
                        <Stack direction="row" alignContent="center" alignItems="center" justifyContent="flex-end" sx={{ marginTop: "0.3rem"}}>
                            <Typography variant="body2">{currentSize}</Typography>  
                            <Box sx={{ textAlign: "center", margin: "0 5px 0 5px"}}>/</Box>
                            <Typography color="text.secondary" variant="body2">{totalSize}</Typography>
                        </Stack>
                    </Stack>
                    <Stack direction="row" alignContent="center" alignItems="center" sx={{ marginLeft: "5px", marginRight: "10px" }}>
                        <Tooltip title="Pause download">
                            <IconButton>
                                <PauseIcon/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Concel download" placement="bottom-end">
                            <IconButton>
                                <CloseIcon/>
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
        </>
    );
}

export default function Downloads(){
    const [hasDownload,setHasDownload] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [queue,setQueue] = useState<any[]>([]);

    useEffect(()=>{
        window._downloads.subscribe((event: any)=>{
            setHasDownload(event.downloadInProgress);
        });
        setQueue(window._downloads.downloadQueue);
        setIsLoading(false);
    },[]);

    if(isLoading) return <Loader/>

    return (
        <div id="downloads">
            <Stack direction="row" justifyContent="space-between" alignContent="center" alignItems="center" sx={{ paddingTop: "0.5rem", height: "102px" }}>
                <CurrentDownload noDownloads={!hasDownload}/>
            </Stack>
            <Divider/>
            <Box sx={{ overflowY: "scroll", height: "100%" }}>
                <List>
                    {queue.map((value: any)=>{
                        return ( 
                            <DownloadItem itemImg={value.img} key={value.uuid} itemName={value.name} btnPropt={value.btn.text}/>
                        );
                    })}
                </List>
            </Box>
        </div>
    );
}