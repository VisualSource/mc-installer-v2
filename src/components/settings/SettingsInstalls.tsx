import { Container, Typography, Box, Button, Switch, FormGroup, FormControlLabel, TextField} from "@mui/material";

export default function SettingsInstalls(){
    return (
        <Container className="add-options">
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Typography variant="h2" >- INSTALLS -</Typography>
            </Box>
            <FormGroup>
                <Button color="error" variant="contained">Clear Mod Cache</Button>
                <Typography>Java Installed: true</Typography>
                <Button color="info" variant="contained">Install Java</Button>
                <FormControlLabel control={<Switch defaultChecked />} label="Cache Mods" />
                <TextField id="outlined-basic" label=".minecraft directory" variant="outlined" />
                <TextField id="outlined-basic" label="minecraft lancher directory" variant="outlined" />
            </FormGroup>
        </Container>
    );
}