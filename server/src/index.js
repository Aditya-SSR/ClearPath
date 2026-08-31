require(`dotenv`).config();
const express = require(`express`);
const cors = require(`cors`);
const { clerkMiddleware } = require(`@clerk/express`);

const app = express();

const requestlogger = require(`./middlewares/logger`);
const requireAuth = require(`./middlewares/auth`);
const webhookRouter = require(`./routes/webhooks`);
const questionnaireRoutes = require(`./routes/questionnaire.routes`);
const profileRoutes = require(`./routes/profile.routes`);

app.use(requestlogger);


app.use(clerkMiddleware());


// MUST stay before express.json(): svix webhook signature verification
// needs the exact raw bytes Clerk sent.
app.use(`/api/webhooks/clerk`, express.raw({ type: `*/*` }), webhookRouter);


const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(`,`).map((origin) => origin.trim()).filter(Boolean)
    : [`http://localhost:3000`];

app.use(cors({ origin: allowedOrigins }));

// JSON body parsing for normal API routes
app.use(express.json());

// Feature routes (Part 1 roadmap engine)
app.use(`/questionnaire`, questionnaireRoutes);
app.use(`/profile`, profileRoutes);

app.get(`/`, (req, res) => {
    const { userId } = req.auth || {};

    if (userId) {
        return res.json(`Welcome back to ClearPath, ${userId}!!`);
    }

    res.json(`Welcome to ClearPath!!`);
});


app.get("/users", requireAuth, (req, res) => {
    res.json(`You are in the users section, ${req.userId}`);
});

// Central error handler — must be registered LAST.
// Keeps thrown errors from crashing the process; services may set err.status.
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || `Internal server error` });
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});