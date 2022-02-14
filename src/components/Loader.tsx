import { Container, CircularProgress, Typography } from '@mui/material';
export default function Loader({ message = "Loading" }: {message?: string} ) {
    return (
        <Container id="vs-loader">
            <CircularProgress size="4rem" />
            <Typography variant="subtitle1">{message}</Typography>
        </Container>
    )
}