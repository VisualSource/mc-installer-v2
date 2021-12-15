import { useEffect, useState } from 'react';
import AppHeader from './AppHeader';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Routes, Route, useNavigate } from "react-router-dom";
import Paper from '@mui/material/Paper';
import AppFooter from './AppFooter';
import Settings from '../pages/Settings';
import Downloads from '../pages/Downloads';
import Mods from '../pages/Mods';
import Modpacks from '../pages/ModPacks';
import Mod from '../pages/Mod';
import Modpack from '../pages/Modpack';
import Profiles from '../pages/Profiles';
import AppStartup from '../pages/loading/AppStartup';
import AppInit from '../core/AppInit';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function AppLoading(props: { loading: boolean }){
  if(props.loading){
    return <AppStartup/>;
  }
  return (
    <>
      <Paper elevation={0} square component="main" id="content">
        <Routes>
          <Route path="/" element={<div className='App'></div>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/downloads" element={<Downloads/>}/>
          <Route path="/mods" element={<Mods/>}/>
          <Route path="/modpacks" element={<Modpacks/>}/>
          <Route path="/mod/:id" element={<Mod/>}/>
          <Route path="/modpack/:id" element={<Modpack/>}/>
          <Route path="/profiles" element={<Profiles/>}/>
        </Routes>
      </Paper>
      <AppFooter/>
    </>
  );
}

function App() {
  const naviagte = useNavigate();
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    const init = async () => {
      await AppInit();
      naviagte("/");
      setLoading(false);
    }
    init();
  },[]);

  return (
    <ThemeProvider theme={theme}>
        <AppHeader/>
        <AppLoading loading={loading} />
    </ThemeProvider>
  );
}

export default App;
