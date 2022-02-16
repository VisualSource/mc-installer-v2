import { atom, useRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { Dialog, Container, Step, StepLabel,Stepper, Button, Switch, Slide, Typography, Box, AppBar, Toolbar, Link, FormControlLabel } from '@mui/material';
import { forwardRef, useState, useReducer} from 'react';
import { TransitionProps } from '@mui/material/transitions';

import { Database, MinecraftProfile } from '../lib/db';
import { useAuth } from '../services/auth';

import { import_profiles, can_run_setup, setup_complete } from '../lib/commands';

export const setup_dialog = atom({
    key: "SetupDialog",
    default: can_run_setup()
});

const steps = [ "Run Setup", "Microsoft Login", "Caching", "Profiles", "Finish"];

const Transition = forwardRef(function Transition(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>){
    return <Slide direction="up" ref={ref} {...props} />
});

function PageHandler({ id, value, children }: { id: number, value: number, children: any}) {
    if(id === value) {
        return children;
    }
    return null;
}

interface SetupState {
    cache_installers: boolean,
    cache_mods: boolean,
}

const defaultState: SetupState = {
    cache_installers: true,
    cache_mods: false,
}

function stateReducer(state: SetupState, action: { type: "cache_i" | "cache_m", payload: any }) {
    switch (action.type) {
        case "cache_i":
            return { ...state, cache_installers: action.payload };
        case "cache_m":
                return { ...state, cache_mods: action.payload };
        default:
            return state;
    }
}

export default function SetupDialog() {
    const [state,dispatch] = useReducer(stateReducer,defaultState);
    const mutation = useMutation((profiles: MinecraftProfile[])=>Database.addBulkProfiles(profiles));
    const [open,setOpen] = useRecoilState(setup_dialog);
    const [activeStep, setActiveStep] = useState<number>(0);
    const [skipped,setSkipped] = useState<Set<number>>(new Set());
    const { login, authenicated } = useAuth();

    const isStepOptional = (step: number) => [2,3,4].includes(step);

    const isStepSkipped = (step: number) => skipped.has(step);

    const handleNext = () => {
        let newSkipped = skipped;

        if(isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }
        setActiveStep((prevActiveStep)=>{
            const next = prevActiveStep + 1;
            if(next >= steps.length) return prevActiveStep;
            return next;

        });
        setSkipped(newSkipped);
    }

    const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);
    
    const handleSkip = () => {
        if(!isStepOptional(activeStep)) {
            throw new Error("You can't skip a step that isn't optional.");
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
        const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    }

    const handleImport = async () => {
        const data = await import_profiles();
        mutation.mutateAsync(data);
    }

    const handleClose = () => setOpen(false);

    const Finish = () => {
        localStorage.setItem("settings", JSON.stringify({
            cache_installers: state.cache_installers,
            cache_mods: state.cache_mods
        }));

        setup_complete();

        handleClose();
    }

    return (
        <Dialog open={open} onClose={handleClose} fullScreen TransitionComponent={Transition}>
            <AppBar sx={{ position: 'relative' }} data-tauri-drag-region>
                <Toolbar data-tauri-drag-region>
                    <Typography>
                        Setup
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container sx={{ marginTop: "10px", height:"calc(100vh - 200px)" }}>
                <Stepper activeStep={activeStep}>
                    {steps.map((label,index)=>{
                        const stepProps: { completed?: boolean } = {}
                        const labelProps: { optional?: React.ReactNode } = {}
                        if(isStepOptional(index)) {
                            labelProps.optional = (
                                <Typography variant="caption">Optional</Typography>
                            );
                        }
                        if(isStepSkipped(index)) {
                            stepProps.completed = false;
                        }

                        return (
                            <Step key={label} {...stepProps}>
                                <StepLabel {...labelProps}>{label}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
                <Box sx={{ height: "100%" }}>
                    <PageHandler id={0} value={activeStep}>
                       <Box sx={{ height: "100%", display: "flex", justifyContent: "center", flexDirection: "column" }}>
                            <Typography variant="h4" sx={{ marginBottom: "10px" }}>Welcome!</Typography>
                            <Typography variant="body1">
                                Looks like this is your first time using this app. 
                                Would you like to run thought the setup process?
                                You can can ignore this and change these settings 
                                later from the settings page.
                            </Typography>
                            <Box sx={{ marginTop: "15px", width: "100%", display: "flex", justifyContent: "space-between" }}>
                                <Button variant="contained" onClick={Finish}>No Thanks</Button>
                                <Button variant="contained" color="success" onClick={handleNext}>Continue</Button>
                            </Box>
                       </Box>
                    </PageHandler>
                    <PageHandler id={1} value={activeStep}>
                        <Box sx={{ height: "100%", display: "flex", justifyContent: "center", flexDirection: "column" }}>
                            <Typography variant="h4" sx={{ marginBottom: "15px" }}>Let get your minecraft Account</Typography>
                            <Typography variant="body1">
                                Starting March 10 2022, a Microsoft account is required to play minecraft.
                                So if you have not migrated your account check here <Link target="_blank" href="https://help.minecraft.net/hc/en-us/articles/360050865492-Minecraft-Java-Edition-Account-Migration-FAQ">Java Migration FAQ</Link>. 
                                If you want more info you can read this <Link target="_blank" href="https://www.minecraft.net/en-us/article/last-call-voluntarily-migrate-java-accounts">Article</Link>.
                            </Typography>
                            { authenicated ? <Typography color="GrayText" variant="h6" sx={{ marginTop: "15px" }}>Already Loggedin</Typography> :  <Button variant="contained" sx={{ marginTop: "15px" }} onClick={login}>Login</Button> }
                        </Box>
                    </PageHandler>
                    <PageHandler id={2} value={activeStep}>
                        <Box sx={{ height: "100%", display: "flex", justifyContent: "center", flexDirection: "column" }}>
                            <Typography variant="h4">Cache</Typography>
                            <Typography variant="body1">
                            When installing mods or modpacks there can be alot of overlap so you can pick 
                            if you want to cache only mods or the installers. 
                            </Typography>
                            <Typography variant="body2" sx={{ marginTop: "15px" }}>
                                Installers are either forge, fabric or optifine.
                                They are rarly need to be download and generaly don't take up alot a space.
                                This option also sometimes can help speed up the install process.
                            </Typography>
                            <FormControlLabel control={<Switch onChange={(event)=>dispatch({ type: "cache_i", payload: event.currentTarget.checked })} checked={state.cache_installers}/>} label="Cache Installers"/>
                            <Typography variant="body2" sx={{ marginTop: "15px" }}>
                                Cache mods can make installs of modpacks fast but can take up large chucks of space.
                                If you don't have alot of space on your divice it be better not to cache mods, but mods have to be download every install
                            </Typography>
                            <FormControlLabel control={<Switch checked={state.cache_mods} onChange={(event)=>dispatch({ type: "cache_m", payload: event.currentTarget.checked})} />} label="Cache Mods"/>
                        </Box>
                    </PageHandler>
                    <PageHandler id={3} value={activeStep}>
                        <Box sx={{ height: "100%", display: "flex", justifyContent: "center", flexDirection: "column" }}>
                            <Typography variant="h4">Profiles</Typography>
                            <Typography variant="body1" sx={{ marginTop: "15px" }}>If your coming from the offical launch we can import your profiles from that launcher. 
                                Would you like to import these profiles?</Typography>
                            <Button onClick={handleImport} variant="contained" sx={{ marginTop: "15px" }}>Import</Button>
                        </Box>
                    </PageHandler>
                    <PageHandler id={4} value={activeStep}>
                        <Box sx={{ height: "100%", width: "100%", display: "flex", justifyContent: "center", flexDirection: "column" }}>
                            <Typography variant="h4">Ok, looks like we got every thing ready for you to get playing.</Typography>
                        </Box>
                    </PageHandler>
                </Box>
                { activeStep !== 0 ? <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                        Back
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    {isStepOptional(activeStep) && (
                        <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>Skip</Button>
                    )}
                    <Button onClick={activeStep === steps.length - 1 ? Finish : handleNext}>
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                </Box> : null }
            </Container>
        </Dialog>
    )
}