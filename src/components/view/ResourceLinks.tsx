import { Button, Paper } from '@mui/material';
export default function ResourceLinks({ links }: { links?: { route: string, name: string }[] | undefined }){
    return (
        <Paper elevation={2} sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
        {links?.map((link,i)=>(
            <Button key={i} size="small" href={link.route} target="_blank">{link.name}</Button>
         ))}
    </Paper>
    );
}