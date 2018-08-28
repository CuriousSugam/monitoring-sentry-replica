import { Router } from "express";
import HttpStatus from "http-status-codes";
import * as projectService from "../services/projectService";
import { findProject } from "../validators/projectValidator";
// import Sentry_Wannabe from "../../../sentry-node-module";

const router = Router();
// const instanceKey = "37cfa9b4-813f-4e1c-8733-265613cb485d";
// Sentry_Wannabe.configure(instanceKey);

/**
 * GET /api/related projects
 */
// router.get("/", (req, res, next) => {
//   projectService
//     .getRelatedProject()
//     .then(data => res.json({ data }))
//     .catch(err => {
//       const errorDetails = err;

//       return Sentry_Wannabe.log({
//         message: "nexadasdasdt error",
//         error: errorDetails
//       });
//     });
// });

/**
 * GET /api/related projects
 */
router.get("/", (req, res, next) => {
  const searchQuery = req.query.search || "";
  const rowsPerPage = parseInt(req.query.rowsPerPage);
  const page = parseInt(req.query.page);

  projectService
    .getRelatedProject(searchQuery, rowsPerPage, page, req.headers.email)
    .then(data => {
      return res.json({ data, pagination: data.pagination });
    })
    .catch(err => next(err));
});

/**
 * GET /api/related projects with id
 */
router.get("/:id", (req, res, next) => {
  projectService
    .getProject(req.params.id, req.headers.userid)
    .then(data => {
      res.json({ data });
    })
    .catch(err => next(err));
});

/**
 * POST /api/projects
 */

// router.post("/", (req, res, next) => {
//   projectService
//     .createNewProject()
//     .then(data => res.status(400).json({ data }))
//     .catch(err => {
//       const errorDetails = err;

//       return Sentry_Wannabe.log({
//         message: "next error",
//         error: errorDetails,
//         level:
//       });
//     });
// });

// /**
//  * POST /api/projects
//  */
router.post("/", (req, res, next) => {
  projectService
    .createNewProject(req.body)
    .then(data => res.status(HttpStatus.CREATED).json({ data }))
    .catch(err => next(err));
});

/**
 *
 * DELETE /api/id
 */
router.delete("/:id", findProject, (req, res, next) => {
  projectService
    .deleteProject(req.params.id)
    .then(() => res.status(204).json({ Success: "Project Deleted" }))
    .catch(err => next(err));
});

router.put("/", (req, res, next) => {
  projectService
    .updateProject(req.headers.projectid, req.headers.project_name, req.headers.description)
    .then(data => res.json({ data }))
    .catch(err => next(err));
});

export default router;
