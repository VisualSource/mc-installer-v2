import { NavLink } from 'react-router-dom';
import { forwardRef } from 'react';
export const LinkedButton = forwardRef<any,any>((props,ref)=>{
    return <NavLink {...props} className={props?.isActiveLink ? ({isActive})=>isActive ? "activated " + props.className : props.className : props.className} ref={ref}/>;
});