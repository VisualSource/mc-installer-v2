import { List, ListItemAvatar, Accordion, AccordionDetails, AccordionSummary, FormControl, InputAdornment, OutlinedInput, Paper, Typography, Avatar, ListItemText, Card, CardContent, CardMedia, Grid, CardActionArea, ListItemButton } from "@mui/material";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import AddIcon from '@mui/icons-material/Add';
import { LinkedButton } from '../LinkedButton';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import DB, { CategoryList } from "../../core/db";

function Category(props: { name: string, items: CategoryList[0]["data"], rootPath: string }){
    return (
    <Accordion>
        <AccordionSummary expandIcon={<AddIcon/>} >{props.name.toUpperCase()} ({props.items.length})</AccordionSummary>
        <AccordionDetails>
            <List dense sx={{ padding: 0 }}>
                {props.items.map((item,i)=>{
                    return (
                        <ListItemButton key={i} component={LinkedButton} to={`${props.rootPath}${item.uuid}`}>
                            <ListItemAvatar sx={{ minWidth: "30px" }}>
                                <Avatar sx={{ borderRadius: 0, width: 24, height: 24 }} src={item.media.icon ?? undefined}/>
                            </ListItemAvatar>
                            <ListItemText>{item.name}</ListItemText>
                        </ListItemButton>
                    );
                })}
            </List>
        </AccordionDetails>
    </Accordion>
    );
}


const getPath = (active: string): string => {
    if(active.includes("modpack")) return "/cdn/modpack/";
    if(active.includes("mod")) return "/cdn/mod/";
    if(active.includes("profile")) return "/cdn/profile/";
    return "mod";
}
export default function ContentSort(){
    const loc = useLocation();
    const [path,setPath] = useState<string>("");
    const [ category, setCategory ] = useState<CategoryList>([]);

    useEffect(()=>{
        const load = async(route: string) => {
            try {
                const db = new DB();
                switch (route) {
                    case "/cdn/mod/": {
                        const mods = await db.getModList();
                        if(mods) setCategory(mods); else setCategory([]);
                        break;
                    }
                    case "/cdn/profile/":{
                        const mods = await db.getProfileList();
                        if(mods) setCategory(mods); else setCategory([]);
                        break;
                    }
                    case "/cdn/modpack/":{
                        const mods = await db.getModpackList();
                        if(mods) setCategory(mods); else setCategory([]);
                        break;
                    }
                    default:
                        setCategory([]);
                        break;
                }
            } catch (error: any) {
                console.error(error);
            }
        }
        const route = getPath(loc.pathname);
        if(route !== path) {
            setPath(route);
            load(route);
        }
        console.log(path,loc,category,route);
    },[loc]);

    return (
        <div id="content-sort">
            <Paper square elevation={4} sx={{paddingLeft: "5px", paddingRight: "5px", paddingTop: "5px"}} id="content-sort-list">
                <FormControl>
                    <OutlinedInput startAdornment={
                        <InputAdornment position="start">
                            <ManageSearchIcon/>
                        </InputAdornment>
                    }></OutlinedInput>
                    {category.map((value,i)=>{
                        return <Category key={i} rootPath={path} name={value._id} items={value.data} />
                    })}
                </FormControl>
            </Paper>
            <Outlet/>
        </div>
    );
}