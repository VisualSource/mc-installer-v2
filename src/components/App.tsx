import { Routes, Route } from 'react-router-dom';
import { Paper } from "@mui/material";
import Header from './header/Header';
import Footer from './footer/Footer';
import ListContainer from './body/ListContainer';
import { ListGroup } from './body/ListGroup';
import Downloads from '../pages/Downloads';
import Home from '../pages/Home';

import ModpackView from '../pages/ModpackView';
import ModView from '../pages/ModView';
import ProfileView from '../pages/ProfileView';

import Modals from '../models';

export default function App() {
    return (
        <Paper square elevation={0} id="app-root">
            <Modals/>
            <Header/>
            <main>
                <Routes>
                    <Route path="*" element={<Home/>}/>
                    <Route path="list" element={<ListContainer/>}>
                        <Route path=":type" element={<ListGroup/>}/>
                    </Route>
                    <Route path="downloads" element={<Downloads/>}/>
                    <Route path="view">
                        <Route path="mods/:uuid" element={<ModView/>}/>
                        <Route path="modpacks/:uuid" element={<ModpackView/>}/>
                        <Route path="profiles/:uuid" element={<ProfileView/>}/>
                    </Route>
                </Routes>
            </main>
            <Footer/>
        </Paper>
    );
}