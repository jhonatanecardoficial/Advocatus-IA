'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { logoutAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

interface LogoutContextType {
    isOpen: boolean
    openLogoutModal: () => void
    closeLogoutModal: () => void
    confirmLogout: () => Promise<void>
    isLoading: boolean
}

const LogoutContext = createContext<LogoutContextType | undefined>(undefined)

export function LogoutProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const openLogoutModal = () => setIsOpen(true)
    const closeLogoutModal = () => setIsOpen(false)

    const confirmLogout = async () => {
        setIsLoading(true)
        try {
            await logoutAction()
            localStorage.removeItem('accessToken');
            setIsOpen(false)
            router.push('/login')
        } catch (error) {
            console.error('Erro ao encerrar sessão:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <LogoutContext.Provider value={{ isOpen, openLogoutModal, closeLogoutModal, confirmLogout, isLoading }}>
            {children}
        </LogoutContext.Provider>
    )
}

export const useLogout = () => {
    const context = useContext(LogoutContext)
    if (!context) throw new Error('useLogout must be used within LogoutProvider')
    return context
}
