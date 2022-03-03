import { FormControl, TextField, Tooltip, List, Typography, Box, Button, ListItem, IconButton, ListItemButton } from '@mui/material';
import TabPanel, { type ITabProps } from "../../components/TabPanel";

import DeleteIcon from '@mui/icons-material/Delete';


export default function MediaTab({ tab, profile, dispatch }: ITabProps) {
    const createLink = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        dispatch({ type: "add_link", payload: { 
            route: data.get("route"), 
            name: data.get("name") 
        }});
    }
  
    return (
        <TabPanel id={2} tab={tab}>
            <FormControl fullWidth sx={{ marginTop: "15px" }}>
                <TextField onChange={(event)=>dispatch({ type: "set_icon", payload: event.target.value })} value={profile?.media.icon ?? ""} label="Icon"/>
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "15px" }}>
                <TextField onChange={(event)=>dispatch({ type: "set_banner", payload: event.target.value })} value={profile?.media.banner ?? ""} label="Banner"/>
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "15px" }}>
                <TextField onChange={(event)=>dispatch({ type: "set_card", payload: event.target.value })} value={profile?.media.card ?? ""} label="Card"/>
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "15px" }}>
                <Typography sx={{ marginBottom: "10px" }}>Links</Typography>
                <form onSubmit={createLink}>
                    <Box sx={{ display: "flex", width: "100%", marginBottom: "15px" }}>
                        <TextField required name="name" fullWidth label="Name"/>
                        <TextField required name="route" fullWidth type="url" label="Url"/>
                    </Box>
                    <Button fullWidth variant="contained" color="success" type="submit">Add Link</Button>
                </form>
                <List dense>
                    {profile?.media.links.map((value,i)=>(
                        <ListItem key={i} secondaryAction={
                            <IconButton edge="end" onClick={()=>dispatch({ type: "remove_link", payload: i })}>
                                <DeleteIcon color="error"/>
                            </IconButton>}>
                            <Tooltip title={value.route}>
                                <ListItemButton href={value.route} target="_blank">{value.name}</ListItemButton>
                            </Tooltip>
                        </ListItem>
                    )) ?? null}
                </List>
            </FormControl>
        </TabPanel>
    );
}