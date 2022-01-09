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
import SettingsDownloads from "../settings/SettingsDownloads";
import SettingsInstalls from "../settings/SettingsInstalls";

import Home from "../Home";

import StartUp from "../modals/StartUp";

export default function App(){
    return (
        <div id="App">
            <StartUp/>
            <Header/> 
            <Paper square component="main" id="app-content" elevation={0}>
                <Routes>
                   <Route path="/" element={<Home/>} />
                   <Route path="settings" element={<Settings/>}>
                        <Route index element={<SettingsAccount/>}/>
                        <Route path="downloads" element={<SettingsDownloads/>}/>
                        <Route path="installs" element={<SettingsInstalls/>}/>
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

/*
  <Route path="mods" element={<ContentSort type="mod"><ContentList type="mod"/></ContentSort>} />
                   <Route path="modpacks" element={<ContentSort type="modpack"><ContentList type="modpack"/></ContentSort>} />
                   <Route path="profiles" element={<ContentSort type="profile"> <ContentList type="profile"/> </ContentSort>} />
                   <Route path="mod/:id" element={<ContentSort type="mod"><ContentInstall isProfile={false}/></ContentSort>} />
                   <Route path="modpack/:id" element={<ContentSort type="modpack"><ContentInstall isProfile={false}/></ContentSort>} />
                   <Route path="profile/:id" element={<ContentSort type="profile"><ContentInstall isProfile={true}/></ContentSort>} />

*/