import { CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import { useRecoilState } from "recoil";
import { startup_modal } from "../state/stateKeys";

export default function StartUp(){
    const [show,setShow] = useRecoilState(startup_modal);
    const handleClose = () => setShow(false);

    return (
        <Dialog fullScreen={false} open={show}>
            <DialogTitle>Launching Minecraft</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Getting your profile and mods ready.
                </DialogContentText>
                <Box sx={{ marginTop: "10px", width: "100%", display: "flex", justifyContent: "center" }}>
                    <CircularProgress/>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    STOP
                </Button>
            </DialogActions>
        </Dialog>
    );
}