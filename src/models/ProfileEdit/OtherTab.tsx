import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { Button } from '@mui/material';
import toast from 'react-hot-toast';
import { dialog } from '@tauri-apps/api';

import TabPanel, { type ITabProps } from "../../components/TabPanel";

import { Database } from '../../lib/db';
import { default_profile } from '../../lib/profile';


export default function OtherTab({ tab, profile, closeHandle }: ITabProps & { closeHandle: () => void } ){
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const mutation = useMutation((id: string | undefined )=>{
        if(!id) throw new Error("Invaild UUID");
        return Database.profileEdit({ uuid: id , data: null }, "delete");
    }, {
        onSuccess: data => {
            queryClient.setQueryData(["ListText","profiles"],data.category);
            queryClient.setQueryData(["List","profiles"],data.text);
        }
    });
    const [defaultProfile, setDefaultProfile] = useRecoilState(default_profile);

    const setAsDefault = () => {
        if(defaultProfile.uuid === profile?.uuid) {
            setDefaultProfile({ uuid: undefined, name: undefined });
            return;
        }
        setDefaultProfile({ uuid: profile?.uuid, name: profile?.name });
    }

    const deleteProfile = async () => {
        const confirm = await dialog.confirm("Are you sure you want to do this. It can't be undone.", "Delete?");
        if(!confirm) return;
        const deletion = mutation.mutateAsync(profile?.uuid);
        await toast.promise(deletion, {
            loading: "Pending...",
            error: "Failed to delete profile",
            success: "Deleted Profile"
        });
        navigate("/list/profiles");
        closeHandle();
    }

    return (
        <TabPanel id={4} tab={tab}>
            <Button variant="contained" color="error" onClick={deleteProfile}>Delete</Button>
            <Button onClick={setAsDefault} variant="contained" sx={{ marginTop: "10px" }}>{defaultProfile.uuid === profile?.uuid ? "Remove as default" : "Set as default"}</Button>
        </TabPanel>
    );
}