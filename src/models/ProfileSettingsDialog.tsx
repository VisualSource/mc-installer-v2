import { atom, useRecoilState } from 'recoil';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface ProfileSettings {
    open: boolean;
    profile: string | undefined;
}

export const settings_profile = atom<ProfileSettings>({
    key: "edit_profile_settings",
    default: {
        open: false,
        profile: ""
    }
});

export default function ProfileSettingsDialog() {
    const [state, setState] = useRecoilState(settings_profile);

    const onClose = () => setState({ ...state, open: false });
    const clear = () => onClose();
    const submit = async () => onClose();

    return (
        <Dialog open={state.open} onClose={onClose} scroll="paper" fullWidth>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent dividers={true}>

            </DialogContent>
            <DialogActions>
                <Button color="error" onClick={clear}>Cancel</Button>
                <Button color="success" onClick={submit}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}