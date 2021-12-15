import { BottomNavigation, BottomNavigationAction} from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import DownloadIcon from '@mui/icons-material/Download';
import CategoryIcon from '@mui/icons-material/Category';
import HomeIcon from '@mui/icons-material/Home';
import {useNavigate} from 'react-router-dom';


export default function AppFooter(){
    const navigate = useNavigate();

    return (
      <BottomNavigation showLabels sx={{ backgroundColor: "#f57c00"}}>
        <BottomNavigationAction label="Home" icon={<HomeIcon/>}  onClick={()=>navigate("/")}/>
        <BottomNavigationAction label="Downloads" icon={<DownloadIcon/>}  onClick={()=>navigate("/downloads")}/>
        <BottomNavigationAction label="Mods" icon={<CategoryIcon/>} onClick={()=>navigate("/mods")}/>
        <BottomNavigationAction label="Modpacks" icon={<ViewModuleIcon/>} onClick={()=>navigate("/modpacks")} />
      </BottomNavigation>
    );
}