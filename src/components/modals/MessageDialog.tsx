import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useRecoilState } from "recoil";
import { message_dialog } from "../state/stateKeys";

export default function MessageDialog(){
    const [state,setState] = useRecoilState(message_dialog);
    const handleClose = () => setState({show: false, title: "", msg: ""});

    return (
        <Dialog open={state.show} onClose={handleClose}>
            <DialogTitle>{state.title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {state.msg}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>OK</Button>
            </DialogActions>
        </Dialog>
    );
}