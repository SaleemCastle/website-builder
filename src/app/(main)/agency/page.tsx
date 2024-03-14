import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async () => {
    const agencyId = await verifyAndAcceptInvitation()
    console.log(agencyId)
    // get users details
    const user = await getAuthUserDetails()
    return (
        <div>Agency</div>
    )
}

export default page