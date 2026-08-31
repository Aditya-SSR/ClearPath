const { clerkClient } = require(`@clerk/express`);
const prisma = require(`../../db`);

/**
 * Ensures a local User row exists for the Clerk user (source of truth: Clerk).
 * The local User.id is what our own tables reference; clerkUserId is the
 * join key back to Clerk. Email/name are pulled from Clerk so the client
 * never has to be trusted for identity data.
 *
 * Placeholder email: Clerk accounts can exist without an email (phone-only
 * signups) but our schema requires a unique email — so we mint a stable,
 * unique placeholder. Flag: revisit if phone-only signups become common.
 */
async function upsertUserFromClerk(clerkUserId) {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    const email = clerkUser.primaryEmailAddress?.emailAddress || `${clerkUserId}@email.not-provided`;
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(` `) || null;

    return prisma.user.upsert({
        where: { clerkUserId },
        update: { email, name },
        create: { clerkUserId, email, name },
    });
}

module.exports = { upsertUserFromClerk };