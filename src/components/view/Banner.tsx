import {Box, Typography} from '@mui/material';
import { Media } from '../../lib/db';

import BackgroundImage from '../../images/background1.png';

export default function Banner({ name, media }: { name: string | undefined, media: Media | undefined }){
    return (
        <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "start", 
            height: "150px", 
            backgroundImage:`url(${media?.banner ?? BackgroundImage})`, 
            backgroundRepeat: "no-repeat", 
            backgroundSize: "cover" 
        }}>
            <Typography variant='h5' sx={{ 
                paddingRight: "0.4rem", 
                backgroundColor: "#292828ab", 
                borderTopRightRadius: "6px",
                width: "max-content",  
                marginTop: "auto", 
                paddingLeft: "0.8rem" 
                }}>{name ?? "Unkown"}</Typography>
        </Box>
    )
}