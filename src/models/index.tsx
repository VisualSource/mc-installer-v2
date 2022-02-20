import CreateProfileDialog from "./CreateProfileDialog";
import ProfileSettingsDialog from './ProfileSettingsDialog';
import SelectProfile from "./SeleteProfile";
import SetupDialog from "./SetupDialog";
import RunningDialog from "./RunningDialog";
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
            <RunningDialog/>
            <SelectProfile/>
            <CreateProfileDialog/>
            <ProfileSettingsDialog/>
        </>
    );
}