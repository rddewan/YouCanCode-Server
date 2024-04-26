import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello From YouCanCode! ....");
})

export default app;