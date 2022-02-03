import { Paper } from "@mui/material";
import Header from "./Header";
import Footer from './Footer';
import { Routes, Route } from 'react-router-dom';
import ContentSort from "./ContentSort";
import ContentList from "./ContentList";
import ContentInstall from "./ContentInstall";
import Downloads from "../Downloads";
import Settings from "../Settings";

import SettingsAccount from "../settings/SettingsAccount";
import Home from "../Home";

import StartUp from "../modals/StartUp";
import ProfileSelection from "../modals/ProfileSelection";
import MessageDialog from "../modals/MessageDialog";
import AddProfileDialog from "../modals/AddProfileDialog";
import EditProfileDialog from "../modals/EditProfileDialog";
import InstallModpack from '../modals/InstallModpack';

export default function App(){
    return (
        <div id="App">
            <StartUp/>
            <ProfileSelection/>
            <MessageDialog/>
            <AddProfileDialog/>
            <EditProfileDialog/>
            <InstallModpack/>
            <Header/> 
            <Paper square component="main" id="app-content" elevation={0}>
                <Routes>
                   <Route path="/" element={<Home/>} />
                   <Route path="settings" element={<Settings/>}>
                        <Route index element={<SettingsAccount/>}/>
                   </Route>
                   <Route path="cdn" element={<ContentSort/>}>
                        <Route path="mods" element={<ContentList type="mod"/>}/>
                        <Route path="profiles" element={<ContentList type="profile"/>}/>
                        <Route path="modpacks" element={<ContentList type="modpack"/>}/>
                        <Route path="mod/:uuid" element={<ContentInstall isProfile={false}/>}/>
                        <Route path="profile/:uuid" element={<ContentInstall isProfile={true}/>}/>
                        <Route path="modpack/:uuid" element={<ContentInstall isProfile={false}/>}/>
                   </Route>
                   <Route path="downloads" element={<Downloads/>}/>
                </Routes>
            </Paper>      
            <Footer/>
        </div>
    );
}