import TextField, { TextFieldProps } from "@mui/material/TextField";


interface InputDescriptionProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength: number;
}


export default function InputDescription({ value, onChange, maxLength, helperText, ...props} : InputDescriptionProps) {
    

    const handleOnChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.value.length <= maxLength) {
            onChange(e)
        }
    }

    return (
        <TextField
            {...props}
            multiline
            value={value}
            onChange={handleOnChange}
            helperText={<span className={(value ? value.length : 0) >= maxLength ? 'text-red-500' : ''}>{value ? value.length : 0} de {maxLength} {helperText}</span>}
        />
    )
};
