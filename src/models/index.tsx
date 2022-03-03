import CreateProfileDialog from "./CreateProfile";
import ProfileEditDialog from "./ProfileEdit";
import SelectProfile from "./SeleteProfile";
import SetupDialog from "./SetupDialog";
import RunningDialog from "./RunningDialog";
import CreateModpack from './CreateModpack'
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';

export default function Modals(){
    return (
        <>  
            <Toaster position="bottom-left" toastOptions={{
                duration: 7000
            }}/>
            <Suspense fallback={null}>
                <SetupDialog/>
            </Suspense>
            <CreateModpack/>
            <RunningDialog/>
            <SelectProfile/>
            <CreateProfileDialog/>
            <ProfileEditDialog/>
        </>
    );
}