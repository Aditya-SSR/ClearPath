const express = require(`express`);
const app = express();

const requestlogger = require(`./middlewares/logger`);

app.use(requestlogger);


app.get(`/`, (req, res) => {
    res.json(`Welcome to ClearPath!!`);
});

app.get("/users", (req, res) => {
    res.json("You are in the users section");
})

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});