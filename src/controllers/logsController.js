import { Router } from "express";
import HttpStatus from "http-status-codes";
import * as logsService from "../services/logsServices";
import * as verifyToken from "../middlewares/verifyTokens";

const router = Router();

/**
 * GET /api/logs
 */
router.get("/", verifyToken.checkAccessToken, (req, res, next) => {
  const searchQuery = req.query.search || "";
  const rowsPerPage = parseInt(req.query.rowsPerPage);
  const page = parseInt(req.query.page);
  logsService
    .getRelatedLogs(searchQuery, rowsPerPage, page, req.headers.instanceid, req.headers.projectid, req.headers.userid)
    .then(data => res.json({ data, pagination: data.pagination }))
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
  console.log("hello from me");
});

/**
 *
 * DELETE /api/id
 */
router.delete("/:id", (req, res, next) => {
  logsService
    .deleteLog(req.params.id)
    .then(() => res.status(204).json({ Success: "Log Deleted" }))
    .catch(err => next(err));
});

export default router;
