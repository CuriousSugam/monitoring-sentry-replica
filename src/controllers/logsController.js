import { Router } from "express";
import HttpStatus from "http-status-codes";
import * as logsService from "../services/logsServices";
import * as verifyToken from "../middlewares/verifyTokens";

const router = Router();

/**
 * GET /api/logs
 */
router.get("/", verifyToken.checkAccessToken, (req, res, next) => {
  logsService
    .getRelatedLogs(req.headers.instanceid, req.headers.projectid, req.headers.userid)
    .then(data => res.json({ data }))
    .catch(err => next(err));
});

router.put("/", verifyToken.checkAccessToken, (req, res, next) => {
  logsService
    .updateLog(req.headers.logid)
    .then(data => res.json({ data }))
    .catch(err => next(err));
});

router.post("/", (req, res, next) => {
  logsService
    .createNewLog(req.body)
    .then(data => res.status(HttpStatus.CREATED).json({ data }))
    .catch(err => next(err));
});

export default router;
