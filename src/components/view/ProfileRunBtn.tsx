import { Button } from "@mui/material";

import { running_dialog } from '../../models/RunningDialog';
import { run_game } from '../../lib/commands';
import { useAuth } from '../../services/auth';

import StartIcon from '@mui/icons-material/PlayArrow';

export default function ProfileRunBtn({ uuid }: { uuid: string | undefined }){
    const { user, authenicated } = useAuth();

    const start = async () => {
        try {
            running_dialog.open();
            await run_game(user?.xuid as string,uuid as string);
        } catch (error) {
            
        }
    }

    if(!authenicated) {
        return (
            <Button sx={{ color: "#FFFFFF" }} size="medium" variant='contained' color="error">Login to Play</Button>
        )
    }

    return (
        <Button onClick={start} sx={{ color: "#FFFFFF" }} size="medium" variant='contained' color="success" startIcon={<StartIcon/>}>Play</Button>
    )
}