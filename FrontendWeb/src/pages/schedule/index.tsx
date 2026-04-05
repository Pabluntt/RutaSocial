import { useMediaQuery, useTheme } from "@mui/material";
import Calendar from "../../component/Calendar";
import Sidebar from "../../component/Sidebar";
import CustomDrawer from "../../component/CustomDrawer";
import DrawerList from "../../component/DrawerList";

export default function Schedule() {

    const theme = useTheme();
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));
    return (
        <div className="flex h-screen overflow-hidden">
            { computerDevice ? 
                <div className="flex grow z-30 ">
                    <Sidebar />
                </div>
                :
                <div className="absolute top-4 z-20 left-2">
                    <CustomDrawer DrawerList={DrawerList} />
                </div>
            }
            <div className="flex grow w-full h-full gap-1 items-center justify-center">
                <div className="grow p-2 sm:p-5 min-h-full w-full">
                    <Calendar />
                </div>
            </div>
        </div>
    )
};
