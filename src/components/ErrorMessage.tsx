import { Container, Typography } from '@mui/material';
export default function ErrorMessage({ message = "" }: {message?: string} ) {
    return (
        <Container id="vs-error-message">
            <Typography variant="h3">There was an error!</Typography>
            <Typography variant="subtitle2">{message}</Typography>
        </Container>
    )
}