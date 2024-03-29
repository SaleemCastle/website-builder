"use server"

import { clerkClient, currentUser } from "@clerk/nextjs"
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
    subaccountId: string | undefined
}) => {
    const authUser = await currentUser()
    let userData
    if (!authUser) {
        const response = await db.user.findFirst({
            where: {
                Agency: {
                    SubAccount: {
                        some: {
                            id: subaccountId
                        }
                    }
                }
            }
        })
        
        if (response) {
            userData = response
        }
    }
    else {
        userData = await db.user.findUnique({
            where: {
                email: authUser?.emailAddresses[0].emailAddress
            }
        })
    }

    if (!userData) {
        console.log("Could not find a user")
    }

    let foundAgencyId = agencyId
    if (!foundAgencyId) {
        if (!subaccountId) {
            throw new Error("You need to provide at least an agency id or subaccount id")
        }

        const response = await db.subAccount.findUnique({
            where: { id: subaccountId }
        })

        if (response) foundAgencyId = response.agencyId
    }

    if (subaccountId) {
        await db.notification.create({
            data: {
                notification: `${userData?.name} | ${description}`,
                User: { connect: { id: userData?.id } },
                Agency: { connect: { id: foundAgencyId } },
                SubAccount: { connect: { id: subaccountId } }
            }
        })
    } else {
        await db.notification.create({
            data: {
                notification: `${userData?.name} | ${description}`,
                User: { connect: { id: userData?.id } },
                Agency: { connect: { id: foundAgencyId } },
            }
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

        await saveActivityLogsNotification({
            agencyId: initationExists?.agencyId,
            description: "Joined",
            subaccountId: undefined,
        })
    
        if (userDetails) {
            await clerkClient.users.updateUserMetadata(user.id, {
                privateMetadata: {
                    role: userDetails.role || 'SUBACCOUNT_USER'
                }
            })

            await db.invitation.delete({
                where: { email: userDetails.email }
            })

            return userDetails.agencyId
        } else {
            return null
        }
    } else {
        const agency = await db.user.findUnique({
            where: {
                email: user.emailAddresses[0].emailAddress
            }
        })

        return agency ? agency : null
    }

}