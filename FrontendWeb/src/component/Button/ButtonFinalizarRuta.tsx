import { Button } from "@mui/material";
import DialogFinishRoute from "../Dialog/DialogFinishRoute";
import { useState } from "react";


export default function ButtonFinalizarRuta() {


    const [ open, setOpen ] = useState(false)


    return (
        <div className="flex absolute w-full h-11">
            <Button 
                className="grow" 
                size="large" 
                variant="contained" 
                color="error" 
                fullWidth 
                sx={{ border : 'none', borderRadius: 0}}
                onClick={() => {setOpen(true)}}
            >
                Finalizar Ruta
            </Button>
            <DialogFinishRoute open={open} setOpen={setOpen}/>
        </div>
    )    
};
