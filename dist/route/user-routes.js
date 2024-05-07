import { Router } from "express";
import { me } from "../data/controllers/user-controller";
const router = Router();
router.get("/", me);
export default router;
//# sourceMappingURL=user-routes.js.map
