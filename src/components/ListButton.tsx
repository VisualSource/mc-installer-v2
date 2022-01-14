import {Menu, Button, ButtonTypeMap, IconButton, IconButtonTypeMap} from '@mui/material';
import React, { useState } from 'react';

interface IListButtonProps {
    name?: string;
    btnProps?: ButtonTypeMap<{}, "button">["props"]
}

interface IListIconButtonProps {
    btnProps?: IconButtonTypeMap<{}, "button">["props"]
    icon: any
}


export function ListIconButton(props: React.PropsWithChildren<IListIconButtonProps>) {
    const [anchor,setAnchor] = useState<HTMLElement | null>(null);
    const open = Boolean(anchor);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchor(event.currentTarget);
    const handleClose = () => setAnchor(null);

    return (
        <>
            <IconButton {...props.btnProps} onClick={handleClick}>
                {props.icon}
            </IconButton>
            <Menu open={open} anchorEl={anchor} onClose={handleClose}>
                {
                    //@ts-ignore
                    props.children && props.children({handleClose})
                }
            </Menu>
        </>
    );
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