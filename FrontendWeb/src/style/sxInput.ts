import { Theme } from "@emotion/react";
import { SxProps } from "@mui/material";

export const sxInput : SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    marginY : 1,
    borderRadius: 2,
    backgroundColor: '#fcfcfc', 
    paddingX: 1.5,
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc',
    transition: 'border 120ms ease-in',
    '&:hover': {
      borderColor: '#566481',
    },

    '&.Mui-focused': {
      borderColor: '#566481',
      outline: '2px solid #56648133',
    },
  },

  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none', 
  },

  '& .MuiOutlinedInput-input': {
    padding: 0,
    height: '1.5rem',
  },
}