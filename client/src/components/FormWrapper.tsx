import { Box } from "@chakra-ui/react"
import { ReactNode } from "react"

type WrapperSize = 'regular' | 'small'

interface IFormProps{
    children: ReactNode,
    size?: WrapperSize
}
const FormWrapper = ({children, size = 'regular' }: IFormProps) => {
    return (
        <Box maxWidth={size==='regular' ? '800px' : '400px'} w='100%' mt={8} mx='auto'>
            {children}
        </Box>
    )
}

export default FormWrapper
