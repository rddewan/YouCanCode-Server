import express from "express";
import userRouter from "./route/user-routes";
import authRouter from "./route/auth-routes";

const app = express();

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

export default app;
