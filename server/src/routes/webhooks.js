const express = require(`express`);
const { verifyWebhook } = require(`@clerk/express/webhooks`);

const router = express.Router();

// ---------------------------------------------------------------------------
// In-memory placeholder "database" so the sync is testable right away.
// TODO: when a real DB is added (MongoDB/Postgres etc.), replace these Map
// operations with actual DB writes — the clerkUserId below is the join key
// you would store alongside your own user details.
// ---------------------------------------------------------------------------
const users = new Map();

const getPrimaryEmail = (data) => {
    const emailRecord = (data.email_addresses || []).find(
        (email) => email.id === data.primary_email_address_id
    );

    return emailRecord ? emailRecord.email_address : null;
};

// Webhooks must be PUBLIC (no requireAuth) — instead, every request is
// verified with Clerk's svix signature. Unsigned/forged requests are rejected.
router.post(`/`, async (req, res) => {
    let evt;

    try {
        // Requires CLERK_WEBHOOK_SIGNING_SECRET (whsec_...) in server/.env
        evt = await verifyWebhook(req);
    } catch (err) {
        console.error(`Webhook verification failed:`, err.message);
        return res.status(400).json({ error: `Webhook verification failed` });
    }

    const { type, data } = evt;

    switch (type) {
        case `user.created`:
        case `user.updated`: {
            users.set(data.id, {
                clerkUserId: data.id,
                username: data.username,
                firstName: data.first_name,
                lastName: data.last_name,
                email: getPrimaryEmail(data),
                imageUrl: data.image_url,
                updatedAt: new Date().toISOString(),
            });
            break;
        }

        case `user.deleted`: {
            users.delete(data.id);
            break;
        }

        default:
            console.log(`Unhandled webhook event type: ${type}`);
    }

    console.log(`Webhook processed: ${type} for user ${data.id || `(no id)`} (total synced users: ${users.size})`);

    res.status(200).json({ received: true });
});

module.exports = router;