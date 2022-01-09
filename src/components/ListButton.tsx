import {Menu, Button, ButtonTypeMap} from '@mui/material';
import React, { useState } from 'react';

interface IListButtonProps {
    name?: string;
    btnProps?: ButtonTypeMap<{}, "button">["props"]
}


export default function ListButton(props: React.PropsWithChildren<IListButtonProps>){
    const [anchor,setAnchor] = useState<HTMLElement | null>(null);
    const open = Boolean(anchor);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchor(event.currentTarget);
    const handleClose = () => setAnchor(null);

    return (
        <>
            <Button {...props.btnProps} children={props?.name ?? props.btnProps?.children} onClick={handleClick}/>
            <Menu open={open} anchorEl={anchor} onClose={handleClose}>
                {
                    //@ts-ignore
                    props.children && props.children({handleClose})
                }
            </Menu>
        </>
    );
}