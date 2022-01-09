import { List, ListItemAvatar, Accordion, AccordionDetails, AccordionSummary, FormControl, InputAdornment, OutlinedInput, Paper, Typography, Avatar, ListItemText, Card, CardContent, CardMedia, Grid, CardActionArea, ListItemButton } from "@mui/material";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import AddIcon from '@mui/icons-material/Add';
import { LinkedButton } from '../LinkedButton';

function Category(props: { name: string, items: any[], rootPath: string }){
    return (
    <Accordion>
        <AccordionSummary expandIcon={<AddIcon/>} >{props.name.toUpperCase()} ({props.items.length})</AccordionSummary>
        <AccordionDetails>
            <List dense sx={{ padding: 0 }}>
                {props.items.map((item,i)=>{
                    return (
                        <ListItemButton key={i} component={LinkedButton} to={`${props.rootPath}CONTENT_ID`}>
                            <ListItemAvatar sx={{ minWidth: "30px" }}>
                                <Avatar sx={{ borderRadius: 0, width: 24, height: 24 }}/>
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


export default function ContentSort(props: React.PropsWithChildren<{ type: "mod" | "profile" | "modpack" }>){
    return (
        <div id="content-sort">
            <Paper square elevation={4} sx={{paddingLeft: "5px", paddingRight: "5px", paddingTop: "5px"}} id="content-sort-list">
                <FormControl>
                    <OutlinedInput startAdornment={
                        <InputAdornment position="start">
                            <ManageSearchIcon/>
                        </InputAdornment>
                    }></OutlinedInput>
                    <Category rootPath={`/${props.type}/`} name="faviortes" items={[{name:"Fabric API", img: ""}]} />
                    <Category rootPath={`/${props.type}/`} name="world gen" items={[{name:"ANMA", img: ""}]} />
                </FormControl>
            </Paper>
            {props.children}
        </div>
    );
}