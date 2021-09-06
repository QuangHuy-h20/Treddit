
import { ReactNode } from "react"
import FormWrapper from "./FormWrapper"
import Navbar from "./Navbar"

interface ILayOutProps{
    children: ReactNode
}

const Layout = ({children} : ILayOutProps) => {

    return (
        <>
         <Navbar />
         <FormWrapper>
         {children}
         </FormWrapper>
        </>
    )
}

export default Layout
