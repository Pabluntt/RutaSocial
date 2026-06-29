import { IconButton, Drawer, useMediaQuery, useTheme } from "@mui/material";
import { JSX, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';




type DrawerListComponent = (props?: { onNavigate?: () => void }) => JSX.Element

export default function CustomDrawer({ DrawerList } : {DrawerList: DrawerListComponent}) {
    
    const [ openDrawer, setOpenDrawer ] = useState(false)

    const toggleDrawer = (toggleDrawer : boolean) => () => {
        setOpenDrawer(toggleDrawer)
    }
    const theme = useTheme();
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));
    
    return (
        <>
            <IconButton 
                data-tour-id="mobile-menu"
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr:0, ml: 0, p: computerDevice ? 2 : 0.5}}
                onClick={toggleDrawer(true)}
            >
                <MenuIcon sx={{ fontSize: computerDevice ? 40 : 32 }} />
            </IconButton>          
            <Drawer
                open={openDrawer}
                onClose={toggleDrawer(false)}
            >
                <DrawerList onNavigate={toggleDrawer(false)} />
            </Drawer>
        </>

    )  
};
