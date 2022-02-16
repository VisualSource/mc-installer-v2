import { Button, FormControl, Typography } from "@mui/material";
import { Box } from "@mui/system";

export default function PickFile({ clickEvent, label, defaultValue, btnText = "Open File", sx = undefined }: { sx?: any, btnText?: string, label: string, defaultValue: string, clickEvent?: () => {} }) {
    return (<FormControl sx={sx}> 
        <Typography sx={{ marginBottom: "5px" }}>{label}</Typography>
            <Box id="file-input" sx={{ display: "flex", flexDirection: "row", alignItems: "center", alignContent: "center" }}> 
                <Button onClick={clickEvent} sx={{ marginRight: "10px" }} variant='contained' size="medium">{btnText}</Button><Typography>{defaultValue}</Typography>
            </Box>
    </FormControl>);
}