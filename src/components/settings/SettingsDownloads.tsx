import { Container, Typography, Box, FormGroup, Switch, FormControlLabel, Button } from "@mui/material";

export default function SettingsDownloads(){
    return (
        <Container className="add-options">
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Typography variant="h2" > - DOWNLOADS -</Typography>
            </Box>
            <FormGroup>
                <Button color="error" variant="contained">Clear Mod Cache</Button>
                <FormControlLabel control={<Switch defaultChecked />} label="Cache Mods" />
            </FormGroup>
        </Container>
    );
}