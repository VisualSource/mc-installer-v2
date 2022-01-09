import { Container, Typography, Box } from "@mui/material";

export default function SettingsDownloads(){
    return (
        <Container className="add-options">
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Typography variant="h2" > - DOWNLOADS -</Typography>
            </Box>
        </Container>
    );
}