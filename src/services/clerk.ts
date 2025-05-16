import { db } from "@/drizzle/db"
import { UserRole, UserTable } from "@/drizzle/schema"
import { getUserIdTag } from "@/features/users/db/cache"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"
import { redirect } from "next/navigation"

let _client: Awaited<ReturnType<typeof clerkClient>> | undefined

async function getClient() {
  if (!_client) {
    _client = await clerkClient()
  }
  return _client
}

export async function getCurrentUser({ allData = false } = {}) {
  const { userId, sessionClaims, redirectToSignIn } = await auth()

  if (userId != null && sessionClaims.dbId == null) {
    redirect("/api/clerk/syncUsers")
  }

  return {
    clerkUserId: userId,
    userId: sessionClaims?.dbId,
    role: sessionClaims?.role,
    user:
      allData && sessionClaims?.dbId != null
        ? await getUser(sessionClaims.dbId)
        : undefined,
    redirectToSignIn,
  }
}

export async function syncClerkUserMetadata(user: {
  id: string
  clerkUserId: string
  role: UserRole
}) {
  const client = await getClient()
  return client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
      dbId: user.id,
      role: user.role,
    },
  })
}

async function getUser(id: string) {
  "use cache"
  cache(getUserIdTag(id))
  console.log("Called")

  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  })
}
