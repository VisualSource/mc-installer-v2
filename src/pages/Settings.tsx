import { Button, Typography, Divider, TextField, FormControlLabel, FormGroup, Switch, Stack } from "@mui/material";

export default function Settings(){
    return (
        <div id="settings">
            <br/>
            <Typography variant="h2">Settings</Typography>
            <br/>
            <Divider/>
            <Stack direction="column" sx={{ width: "217px" }}>
                <Stack direction="row" justifyContent="flex-start" >
                    <Typography variant="h4">Java</Typography>
                </Stack>
                <br/>
                <Stack direction="row">
                    <Typography sx={{ marginRight: "5px" }}>Java installed:</Typography>
                    <Typography color="green">Yes</Typography>
                </Stack>
                <br/>
                <Button color="success" variant="contained">Install Java</Button>
            </Stack>
            <Divider/>
            <br/>
            <FormGroup>
                <Stack direction="row" justifyContent="flex-start" >
                    <Typography variant="h4">Minecraft</Typography>
                </Stack>
                <br/>
                <TextField id="outlined-basic" label=".minecraft" helperText="dot minecraft folder" variant="outlined" defaultValue="C:/USER/Romaing"/>
                <FormControlLabel control={<Switch color="success" defaultChecked />} label="Cache mods" />
                <Button variant="contained" color="warning">Clear mods cache</Button>
            </FormGroup>
        </div>
    );
}