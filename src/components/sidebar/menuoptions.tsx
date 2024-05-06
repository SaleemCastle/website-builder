'use client'
import { AgencySidebarOption, SubAccount, SubAccountSidebarOption } from '@prisma/client'
import React, { useMemo } from 'react'

type Props = {
    defaultOpen?: boolean
    subAccounts: SubAccount[]
    sidebarOptions: AgencySidebarOption[] | SubAccountSidebarOption[]
    sidebarLogo: string
    details: any
    user: any
    id: string
}

const MenuOptions = ({ details, id, sidebarLogo, sidebarOptions, subAccounts, user, defaultOpen }: Props) => {
    const openState = useMemo(() => {
         
    }, [defaultOpen])
    return (
        <div>MenuOptions</div>
    )
}

export default MenuOptions