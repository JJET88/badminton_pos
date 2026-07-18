"use client"

import { Toaster } from "react-hot-toast"
import { ToggleProvider } from "../context/ToggleContext"
import { ThemeProvider } from "../context/ThemeContext"

export default function ClientLayout({ children }) {
  
  return (
    <ThemeProvider>
      <ToggleProvider>
        
        {children}
        <Toaster reverseOrder={false} />
      </ToggleProvider>
    </ThemeProvider>
  )
}

