import { Container, Typography, Box, FormGroup, TextField} from "@mui/material";

export default function SettingsMinecraft(){
    return (
        <Container className="add-options">
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Typography variant="h2" >- Minecraft -</Typography>
            </Box>
            <FormGroup>
                <TextField id="outlined-basic" label="java exc" variant="outlined" />
                <TextField id="outlined-basic" label="minecaft jar flags" variant="outlined" />
            </FormGroup>
            <FormGroup>
                <TextField id="outlined-basic" label=".minecraft directory" variant="outlined" />
            </FormGroup>
        </Container>
    );
}