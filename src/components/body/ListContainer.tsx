import { Outlet, useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { Button, Paper, Box, List } from "@mui/material";
import Loader from '../Loader';
import ErrorMessage from '../ErrorMessage';
import TextListGroup, {TextListItem} from './TextListGroup';

import { getListCategory } from '../../lib/db';
import { create_profile } from '../../models/CreateProfile';

import PackImage from '../../images/pack.webp';

import PlusIcon from '@mui/icons-material/Add';

export default function ListContainer(){
    const setOpenCreate = useSetRecoilState(create_profile); 
    const params = useParams();
    const { data, error, isLoading } = useQuery<any,Error>(["ListText",params.type],()=>getListCategory(params.type as any), { enabled: !!params.type });

    if(error) return (<ErrorMessage message={error.message}/>)

    return (
        <div id="vs-list-container">
            <Paper square component="aside" sx={{ overflowY: "scroll", overflowX: "hidden" }}>
                {isLoading ? (<Loader/>) : (
                    <>
                    {params.type === "profiles" ? (
                        <Box sx={{ padding: "5px" }}>
                            <Button onClick={()=>setOpenCreate(true)} sx={{ color: "#FFFFFF" }} size="small" startIcon={<PlusIcon/>} fullWidth variant='contained' color="success">New Profile</Button>
                        </Box>
                    ) : null}
                    <List dense>
                        { Object.keys(data).map((cat,i)=>{
                            return (
                                <TextListGroup name={cat} key={i}>
                                    {data[cat].map((value: any, ki: number)=>{
                                        return (<TextListItem name={value.name} icon={value.media?.icon ?? PackImage} uuid={value.uuid} key={ki} />)
                                    })}
                                </TextListGroup>
                            );
                        }) }
                    </List>
                    </>
                  )}
            </Paper>
            <Box sx={{ overflowY: "scroll" }}>
                <Outlet/>
            </Box>
        </div>
    );
}