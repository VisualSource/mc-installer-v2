import { List, ListItemButton, ListItemText, Collapse, ListItemAvatar, Avatar } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FeedIcon from '@mui/icons-material/Feed';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function TextListItem({ name, icon, uuid }: { name: string, icon: string, uuid: string }) {
    const navigate = useNavigate();
    const params = useParams();
    return (
        <ListItemButton onClick={()=>{
            navigate(`/view/${params.type}/${uuid}`)
        }} sx={{ pl: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", ":hover": { overflow: "visible" } }}>
            <ListItemAvatar sx={{ minWidth: "30px" }}>
               <Avatar variant='square' sx={{ width: 24, height: 24 }} src={icon}>
                    <FeedIcon htmlColor='white' fontSize="small"/>
               </Avatar>
            </ListItemAvatar>
            <ListItemText primary={name}/>
        </ListItemButton>
    );
}

export default function TextListGroup({ name, children }: { name: string, children: any }){
    const [open,setOpen] = useState<boolean>(false);
    const handleClick = () => setOpen(!open);
    return( 
        <>
          <ListItemButton onClick={handleClick}>
                <ListItemText primary={name}/>
                {open ? <ExpandLess/> : <ExpandMore/>}
            </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding dense> 
                    {children}
                </List>
            </Collapse>
        </>
    )
}