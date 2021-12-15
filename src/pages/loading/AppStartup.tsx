import { CircularProgress, Paper, Stack, Typography } from "@mui/material";

export default function AppStartup(){
    return ( 
        <Stack id="app-loader" direction="column" alignContent="center" alignItems="center" justifyContent="center">
            <Paper elevation={4} sx={{ padding: "2em"}}>
                <Stack direction="column" alignContent="center" alignItems="center" justifyContent="center">
                    <CircularProgress/>
                    <Typography variant="h6" sx={{ marginTop: "0.5em" }}>Loading</Typography>
                </Stack>
            </Paper>
        </Stack>
    );
}