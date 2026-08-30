require(`dotenv`).config();
const express = require(`express`);
const { clerkMiddleware, getAuth } = require(`@clerk/express`);

const app = express();

const requestlogger = require(`./middlewares/logger`);

app.use(requestlogger);

// Clerk middleware — attaches req.auth to every request (does not block anyone by itself)
app.use(clerkMiddleware());

// Auth guard — implements the recommended pattern in place of the deprecated
// requireAuth() from @clerk/express: unauthenticated requests get a 401 JSON response.
const requireAuth = (req, res, next) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: `Unauthorized` });
    }

    next();
};

// Public route — anyone can access, signed in or not
app.get(`/`, (req, res) => {
    const { userId } = getAuth(req);

    if (userId) {
        return res.json(`Welcome back to ClearPath, ${userId}!!`);
    }

    res.json(`Welcome to ClearPath!!`);
});

// Protected route — unauthenticated requests are rejected with 401
app.get("/users", requireAuth, (req, res) => {
    const { userId } = getAuth(req);

    res.json(`You are in the users section, ${userId}`);
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});