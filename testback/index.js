const { response } = require("express");
const express = require("express");
const app = express();

const port=3000;
const admin = (req, res) => {
    return res.send("Admin Dashboard");
}

const isAdmin= (req, res,next) => {
    console.log("isAdmin is running");
    next();
};

app.get("/admin",isAdmin,admin)

app.get("/", (req, res) => {
    return res.send("Hello");
});
app.get("/signin", (req, res) => {
    return res.send("Signed in");
});

app.listen(port, () => {
    console.log("Server is running...");
});