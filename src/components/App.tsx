import { Routes, Route } from 'react-router-dom';
import { Paper } from "@mui/material";
import Header from './Header';
import Footer from './Footer';
import { login, logout } from '../lib/commands';

export default function App() {
    return (
        <Paper square elevation={0}>
            <Header/>
            <main>
                <Routes>
                    <Route path="*" element={ 
                    <div>
                        <button onClick={login}>Login</button>
                        <button onClick={()=>logout("XUID")}>Logout</button>
                    </div>}/>
                </Routes>
            </main>
            <Footer/>
        </Paper>
    );
}