import { getAuthUserDetails } from '@/lib/queries'
import React from 'react'
import MenuOptions from './menuoptions'

type Props = {
    id: string
    type: "agency" | "subaccount"
}

const Sidebar = async ({ id, type }: Props) => {
    const user = await getAuthUserDetails()

    if (!user) return null

    if (!user.Agency) return

    const details = 
        type === "agency" && user
            ? user?.Agency 
            : user?.Agency.SubAccount.find((subaccount) => subaccount.id === id)
    
    const isWhiteLabelAgency = user.Agency.whiteLabel
    if (!details) return

    let sidebarLogo = user.Agency.agencyLogo || '/assets/plura-logo.svg'

    if (!isWhiteLabelAgency) {
        if (type === 'subaccount') {
            sidebarLogo = user?.Agency.SubAccount.find(subaccount => 
                subaccount.id === id)?.subAccountLogo || user.Agency.agencyLogo
        }
    }

    const sidebarOptions = type === 'agency' 
        ? user.Agency.SidebarOption || []
        : user.Agency.SubAccount.find(subaccount => subaccount.id === id)?.SidebarOption || []

    const subAccounts = user.Agency.SubAccount.filter(subaccount => {
        user.Permissions.find(permission => permission.subAccountId === subaccount.id && permission.access)
    })
    return (
        <>
            <MenuOptions 
                defaultOpen
                details={ details }
                id={ id }
                sidebarLogo={ sidebarLogo }
                sidebarOptions={ sidebarOptions }
                subAccounts={ subAccounts }
                user={ user }
            />
            <MenuOptions
                details={ details }
                id={ id }
                sidebarLogo={ sidebarLogo }
                sidebarOptions={ sidebarOptions }
                subAccounts={ subAccounts }
                user={ user }
            />
        </>
    )
}

export default Sidebar