import { Box, Typography, List, Paper, ListItemButton, Avatar, ListItemAvatar, ListItemText } from '@mui/material';
import AppsIcon from "@mui/icons-material/Apps";

export default function ModList({ mods, displayName = "Mod List" }: { displayName?: string, mods: any[] | undefined }){
    return (
        <Box sx={{ marginTop: "1rem" }}>
            <Typography variant='h5'>{displayName}</Typography>
                <Paper elevation={3}>
                    <Box sx={{ paddingLeft: "5px", paddingBottom: "10px" }}>
                        <details className="modlist">
                            <summary>View</summary>
                            <List dense>
                                {mods?.map((mod,i)=>(
                                    <ListItemButton>
                                        <ListItemAvatar>
                                            <Avatar className="btn-square" sx={{ color: "#FFFFFF", width: "28px", height: "28px"  }}>
                                                <AppsIcon/>
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={"MOD NAME"}/>
                                    </ListItemButton>
                                ))}
                            </List>
                        </details>
                    </Box>
            </Paper>
        </Box>
    );
}