require(`dotenv`).config();
const express = require(`express`);
const cors = require(`cors`);
const { clerkMiddleware, getAuth } = require(`@clerk/express`);

const app = express();

const requestlogger = require(`./middlewares/logger`);
const webhookRouter = require(`./routes/webhooks`);

app.use(requestlogger);

// Clerk middleware — attaches req.auth to every request (does not block anyone by itself)
app.use(clerkMiddleware());

// Webhook route — MUST stay before express.json(): svix signature verification
// needs the exact raw bytes Clerk sent, so it is parsed with express.raw().
// Public route, protected by signature verification instead of a session.
app.use(`/api/webhooks/clerk`, express.raw({ type: `*/*` }), webhookRouter);

// CORS — allows the Next.js frontend (localhost:3000) to call this API with
// an Authorization: Bearer <session token> header. Override with CORS_ORIGIN
// in server/.env (comma-separated list for multiple origins).
// NOTE: an array is used (not a string) so the Access-Control-Allow-Origin
// header is only sent for origins actually in the allow-list.
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(`,`).map((origin) => origin.trim()).filter(Boolean)
    : [`http://localhost:3000`];

app.use(cors({ origin: allowedOrigins }));

// JSON body parsing for normal API routes
app.use(express.json());

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