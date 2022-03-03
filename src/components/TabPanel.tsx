import { Box } from '@mui/material';
import { type MinecraftProfile } from '../lib/db';
export interface ITabProps {
    tab: number;
    profile: MinecraftProfile | undefined;
    dispatch: ({type, payload}: { type: string, payload: any })=> void
}

export default function TabPanel(props: { id: number, tab: number, children: any }) {
    if(props.id === props.tab) {
        return (
            <Box role="tabpanel" sx={{ marginTop: "10px", display: "flex", flexDirection: "column" }}>
                {props.children}
            </Box>
        );
    }
    return null;
}