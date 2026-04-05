import { Autocomplete, AutocompleteProps, TextField, TextFieldVariants } from "@mui/material";

interface ComboBoxProps extends Omit<AutocompleteProps<string, false | true, false | true, false | true>, 'renderInput'> {
  label: string;
  variant ?: TextFieldVariants
  options: string[];
  placeholder ?: string
}


export default function ComboBox({ options, placeholder, label, fullWidth, variant, ...rest} : ComboBoxProps ) {

    return (
        <Autocomplete
            options={options}
            sx= {{ width : fullWidth ? '100%' : 300 }}
            renderInput={(params) => <TextField {...params} variant={variant} label={label} placeholder={placeholder}/>}
            {...rest}
        />
    )
};
