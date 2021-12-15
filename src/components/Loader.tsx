import { CircularProgress, Stack } from "@mui/material";

export default function Loader(){
    return (
        <Stack direction="column" sx={{ height: "100%"}} alignContent="center" alignItems="center" justifyContent="center">
            <CircularProgress color="warning"/>
        </Stack>
    );
}