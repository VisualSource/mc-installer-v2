import { Stack, Typography, Grid, Divider, Button} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Loader from "../components/Loader";
import type { Modpack as IModpack } from "../core/Database";
export default function Modpack(){
    const navigate = useNavigate();
    const params = useParams();
    const [isLoading, setIsLoader] = useState(true);
    const [mod,setMod] = useState<IModpack>()

    useEffect(()=>{
        const init = async () => {
            try {
                setIsLoader(true);
                const modpack = await window._db.getCollection("modpacks").findOne({ _uuid: params["id"] });
                setMod(modpack as IModpack);
                setIsLoader(false);
            } catch (error) {
                console.error(error);
            }
        }
        init();
    },[params]);

    if(isLoading) return (<Loader/>);

    return (
        <Stack direction="row" sx={{ height:"100%" }}>
            <Grid container sx={{ height:"100%", maxHeight: "100%" }}>
                <Grid item xs={8} sx={{ paddingLeft: "1rem" }} >
                    <br/>
                    <Typography variant="h4" >{mod?.name}</Typography>
                    <Divider/>
                    <Stack direction="row" justifyContent="center" sx={{ width: "100%", marginTop: "1.5rem" }}>  
                            <img src={mod?.img} alt="modpack preview" width="50%" height="50%"/>
                    </Stack>
                    <p>{mod?.desc_long}</p>
                    <Stack direction="column" sx={{ marginTop: "1rem" }} justifyContent="flex-end">
                        <Button onClick={()=>navigate("/modpacks")} color="warning" variant="contained">Back</Button>
                    </Stack>
                </Grid>
                <Grid item xs={4} sx={{ paddingRight: "0.5rem", paddingLeft: "0.5rem" }}>
                    <Stack direction="column" sx={{ height: "100%" }} justifyContent="center">
                        <Button color="success" variant="contained">install</Button>
                    </Stack>
                </Grid>
            </Grid>
        </Stack>
    );
}