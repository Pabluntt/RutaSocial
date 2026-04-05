import { IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

export default function CloseDialogButton({ handleClose } : { handleClose : () => void}) {
    return (
        <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme.palette.grey[600],
            })}
        >
            <CloseIcon />
        </IconButton>
    )
};
