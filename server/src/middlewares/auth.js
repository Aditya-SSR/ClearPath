const { getAuth } = require(`@clerk/express`);

// Auth guard — implements the recommended pattern in place of the deprecated
// requireAuth() from @clerk/express: unauthenticated requests get a 401 JSON
// response. On success, req.userId carries the Clerk user id for handlers.
const requireAuth = (req, res, next) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: `Unauthorized` });
    }

    req.userId = userId;
    next();
};

module.exports = requireAuth;