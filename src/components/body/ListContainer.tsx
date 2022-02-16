import { Outlet, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Paper } from "@mui/material";
import { Box, List } from '@mui/material';
import Loader from '../Loader';
import ErrorMessage from '../ErrorMessage';
import TextListGroup, {TextListItem} from './TextListGroup';

import { getListCategory } from '../../lib/db';

export default function ListContainer(){
    const params = useParams();
    const { data, error, isLoading } = useQuery<any,Error>(["ListText",params.type],()=>getListCategory(params.type as any), { enabled: !!params.type });

    if(error) return (<ErrorMessage message={error.message}/>)

    return (
        <div id="vs-list-container">
            <Paper square component="aside" sx={{ overflowY: "scroll", overflowX: "hidden" }}>
                {isLoading ? (<Loader/>) : (
                    <List dense>
                        { Object.keys(data).map((cat,i)=>{
                            return (
                                <TextListGroup name={cat} key={i}>
                                    {data[cat].map((value: any, ki: number)=>{
                                        return (<TextListItem name={value.name} icon={value.media?.icon ?? "https://via.placeholder.com/150/771796"} uuid={value.uuid} key={ki} />)
                                    })}
                                </TextListGroup>
                            );
                        }) }
                    </List>
                  )}
            </Paper>
            <Box sx={{ overflowY: "scroll" }}>
                <Outlet/>
            </Box>
        </div>
    );
}