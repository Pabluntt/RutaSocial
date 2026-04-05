import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ComboBox from '../Button/ComboBox';
import CloseDialogButton from '../Button/CloseDialogButton';
import { useRiskUpdateDialog } from '../../context/RiskUpdateContext';
import InputDescription from '../Input/InputDescription';
import { RiskStatus } from '../../Enums/RiskStatus';
import { useRisks, useUpdateRisk } from '../../api/hooks/RiskHooks';
import { useEffect } from 'react';
import { Alert, CircularProgress } from '@mui/material';



const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));


export default function DialogUpdateRisk() {

    const [ risk, setRisk ] = useRiskUpdateDialog() /*Context Provider */
    const { isSuccess, isPending, isError, isIdle, mutate, error, reset } = useUpdateRisk()
    const { refetch } = useRisks()
    
    const clearStates = () => {
        reset()
    }

    const handleClose = () => {
        clearStates()
        setRisk(undefined)
    }

    const handleSubmit = () => {
        if(!risk) return 
        mutate(risk)
    }

    useEffect(() => {
        if(isSuccess) {
            refetch()
            setTimeout(() => {
                handleClose()
            }, 1000)
        }
    }, [isSuccess])

    useEffect(() => {
        console.log(risk)
    }, [risk])

    if(risk === undefined) {
        return null
    }

    return (
        <BootstrapDialog 
            fullWidth
            open={risk !== undefined}
            onClose={handleClose}
            aria-labelledby='risk-update-titulo'
            keepMounted
            
        >
            <DialogTitle className='m-0 p-2' id="risk-update-titulo">
                {
                    isIdle ? 'Modificar Riesgo' :
                    isPending ? 'Cargando...' :
                    isSuccess ? 'Riesgo modificado' :
                    isError ? `Ha ocurrido un error` :
                    'Error desconocido'
                }
            </DialogTitle>
            <CloseDialogButton handleClose={handleClose} />

            <DialogContent>
                { isIdle ? 
                    <div className='flex flex-col gap-4'>
                        <InputDescription 
                            maxLength={256}
                            value={risk.description} 
                            onChange={(e) => setRisk({...risk, description : e.target.value})}   
                            fullWidth
                            variant='standard'      
                            label='Descripción'      
                        />
                        <ComboBox label={'Estado'} value={risk.status} options={Object.values(RiskStatus)} onChange={(e, v) => {setRisk({...risk, status : v as RiskStatus})}}/>
                    </div>
                    :
                    isPending ? 
                    <div className='flex grow items-center justify-center'>
                        <CircularProgress size={70} />
                    </div>           
                    :
                    <Alert sx={{ mt: 2, width: '100%', minHeight: '80px', display: 'flex', alignItems: 'center', fontSize: '1rem' }} variant='standard' severity={ isSuccess ? 'success' : isError ? 'error' : 'info'}>
                            {isSuccess ? 'Se modifico el riesgo exitosamente' : isError ? `Hubo un error al intentar modificar el riesgo: ${(error as any).error}` : 'Error desconocido'}
                    </Alert>        
                }
            </DialogContent>
            <DialogActions>
                { isIdle ? 
                    <>
                        <Button variant='contained' onClick={handleSubmit}>
                            Listo 
                        </Button>
                        <Button variant='contained' onClick={handleClose}>
                            Cancelar
                        </Button>
                    </>
                    :
                    <>
                        <Button variant='contained' onClick={handleClose}>
                            Cancelar
                        </Button>
                    </>
                }
            </DialogActions>
        </BootstrapDialog>
    )    
};
