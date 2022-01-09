import { NavLink } from 'react-router-dom';
import { forwardRef } from 'react';
export const LinkedButton = forwardRef<any,any>((props,ref)=>{
    return <NavLink ref={ref} {...props}/>;
});