"use server"

import { currentUser } from "@clerk/nextjs"
import { db } from "./db"
import { redirect } from "next/navigation"
import { User } from "@prisma/client"

export const getAuthUserDetails = async () => {
    const user = await currentUser()

    if (!user) {
        return
    }

    const userData = await db.user.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress
        },
        include: {
            Agency: {
                include: {
                    SidebarOption: true,
                    SubAccount: {
                        include: {
                            SidebarOption: true
                        }
                    }
                }
            },
            Permissions: true
        }
    })

    return userData
}

export const saveActivityLogsNotification = async ({
    agencyId,
    description,
    subaccountId
}: {
    agencyId?: string,
    description: string,
    subaccountId: string
}) => {
    const authUser = await currentUser()

    if (!authUser) {
        const response = await db.user.findFirst({
            
        })
    }
}

export const createTeamUser = async (agencyId: string, user: User) => {
    if (user.role === 'AGENCY_OWNER') return null

    const response = await db.user.create({ data: { ...user } })
    return response
}

export const verifyAndAcceptInvitation = async () => {
    const user = await currentUser()
    if (!user) return redirect("/sign-in")

    const initationExists = await db.invitation.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
            status: 'PENDING'
        }
    })

    if (initationExists) {
        const userDetails = await createTeamUser(initationExists.agencyId, {
            email: initationExists.email,
            agencyId: initationExists.agencyId,
            avatarUrl: user.imageUrl,
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: initationExists.role,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }
}