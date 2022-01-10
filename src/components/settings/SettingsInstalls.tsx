import { Container, Typography, Box, Button, FormGroup, TextField} from "@mui/material";

export default function SettingsInstalls(){
    return (
        <Container className="add-options">
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Typography variant="h2" >- INSTALLS -</Typography>
            </Box>
            <FormGroup>
                <Typography>Java Installed: true</Typography>
                <Button color="info" variant="contained">Install Java</Button>
                <TextField id="outlined-basic" label=".minecraft directory" variant="outlined" />
                <TextField id="outlined-basic" label="minecraft lancher directory" variant="outlined" />
            </FormGroup>
        </Container>
    );
}