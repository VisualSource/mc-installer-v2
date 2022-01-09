import { List, ListItemButton, Paper } from "@mui/material";
import {Outlet} from 'react-router-dom';
import { LinkedButton } from "./LinkedButton";
export default function Settings(){
    return (
        <div id="settings">
            <Paper square elevation={1}>
                <List>
                    <ListItemButton component={LinkedButton} to="/settings">
                        ACCOUNT
                    </ListItemButton>
                    <ListItemButton component={LinkedButton} to="/settings/downloads">
                        DOWNLOADS
                    </ListItemButton>
                    <ListItemButton component={LinkedButton} to="/settings/installs">
                        INSTALLS
                    </ListItemButton>
                </List>
            </Paper>
            <Outlet/>
        </div>
    );
}