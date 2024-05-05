import { getAuthUserDetails } from '@/lib/queries'
import React from 'react'

type Props = {
    id: string
    type: "agency" | "subaccount"
}

const Sidebar = async ({ id: type }: Props) => {
    const user = await getAuthUserDetails()

    return (
        <div>Sidebar</div>
    )
}

export default Sidebar