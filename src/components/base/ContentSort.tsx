import { Box, List, ListItemAvatar, Accordion, AccordionDetails, AccordionSummary, FormControl,  Paper, Avatar, ListItemText, ListItemButton, CircularProgress } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { LinkedButton } from '../LinkedButton';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import { CategoryList } from "../../core/db";
import { load_content } from '../state/getContent';  
import AppsIcon from '@mui/icons-material/Apps';

type RouteType = { route: "/cdn/mod/" | "/cdn/modpack/" | "/cdn/profile/", type: "mod" | "modpack" | "profile" | "unset" };

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
                                <Avatar sx={{ color:"white", borderRadius: 0, width: 24, height: 24 }} src={item.media.icon ?? undefined}>
                                    <AppsIcon/>
                                </Avatar>
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

const getPath = (active: string): RouteType => {
    if(active.includes("modpack")) return { route: "/cdn/modpack/", type: "modpack"};
    if(active.includes("profile")) return { route: "/cdn/profile/", type: "profile"};
    return { route: "/cdn/mod/", type: "mod" };
}
export default function ContentSort(){
    const loc = useLocation();
    const [path,setPath] = useState<RouteType>({ route: "/cdn/mod/", type: "unset" });
    const [ category, setCategory ] = useState<CategoryList>([]);
    const [loading,setLoading] = useState<boolean>(true);

    useEffect(()=>{
        const route = getPath(loc.pathname);
        if(route.type !== path.type) {
            setPath(route);
            load_content(route.type,setCategory,setLoading);
        }
    },[loc,path.type]);

    return (
        <div id="content-sort">
            <Paper square elevation={4} sx={{paddingLeft: "5px", paddingRight: "5px", paddingTop: "5px"}} id="content-sort-list">
                <FormControl sx={{ height: "100%" }}>
                        {
                            loading ? (
                                <Box sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", flexDirection: "column", alignContent: "center", alignItems: "center" }}>
                                    <CircularProgress/>
                                </Box>
                            ) : category.map(
                                (value,i)=>(<Category key={i} rootPath={path.route} name={value._id} items={value.data} />))
                        }
                </FormControl>
            </Paper>
            <Outlet/>
        </div>
    );
}