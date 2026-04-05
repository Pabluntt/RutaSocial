import { ListItem, ListItemText, Typography } from "@mui/material";
import { useState } from "react";
import { formatRelative } from "date-fns";
import { es } from "date-fns/locale";
import { Notice } from "../api/models/Notice";





export default function Mensaje({ value, index } : { value : Notice, index : number }) {

  const MAX_LENGTH = 100
  const [ msg, setMsg ] = useState(value.description as string)
  const [ isTruncated, setIsTruncated ] = useState(msg.length > MAX_LENGTH)
  const [ toggleIsShowingMore, setIsShowingMore ] = useState(false)
  
  


  return (
    <ListItem key={index}>
      <ListItemText
        disableTypography
        primary={
                <div className="flex flex-row gap-3" >
                    <Typography
                        component={"span"}
                        variant='body2'
                        sx={{ color : '#424242'}}
                    >
                        {value.authorName}
                    </Typography>
                    <Typography
                        lineHeight={1.7}
                        component={"span"}
                        variant="caption"
                        sx={{ color : '#757575', textAlign : 'end', my : 0.05}}
                    >
                        {formatRelative(value.createdAt, new Date(), { locale : es })}
                    </Typography>
                </div>
        }
      
        secondary={
              <div className="p-4 pb-0 text-justify">
                  <Typography
                      component={"span"}
                      variant='body1'
                      sx={{ color : 'text.primary', display : 'inline' }}
                  >
                      { isTruncated && !toggleIsShowingMore ? 
                          msg.slice(0, MAX_LENGTH) + '... ' 
                          :
                          msg + ' '
                      }
                  </Typography>   
                  { isTruncated ? 
                    <button className="text-green-700 underline cursor-pointer" onClick={() => setIsShowingMore(prev => !prev)} >
                      { toggleIsShowingMore ? 'Ver menos' : 'Ver más' }  
                    </button>  
                    :
                    <></>
                  }
              </div>      
        }
      />
    </ListItem>
  )    
};
