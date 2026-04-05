import { IconButton, Drawer, useMediaQuery, useTheme } from "@mui/material";
import { JSX, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';




export default function CustomDrawer({ DrawerList } : {DrawerList: () => JSX.Element}) {
    
    const [ openDrawer, setOpenDrawer ] = useState(false)

    const toggleDrawer = (toggleDrawer : boolean) => () => {
        setOpenDrawer(toggleDrawer)
    }
    const theme = useTheme();
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));
    
    return (
        <>
            <IconButton 
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr:0, ml: 0, p: computerDevice ? 2 : 1}}
                onClick={toggleDrawer(true)}
            >
                <MenuIcon sx={{ fontSize: 40 }} />
            </IconButton>          
            <Drawer
                open={openDrawer}
                onClose={toggleDrawer(false)}
            >
                <DrawerList />
            </Drawer>
        </>

    )  
};
