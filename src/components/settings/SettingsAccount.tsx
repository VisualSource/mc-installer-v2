import { Container, Typography, Button } from "@mui/material";
import { Box } from "@mui/system";

export default function SettingsAccount(){
    return (
        <Container className="add-options">
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Typography variant="h2" > - ACCOUNT -</Typography>
            </Box>
            <Button variant="contained">LOGOUT</Button>
        </Container>
    );
}