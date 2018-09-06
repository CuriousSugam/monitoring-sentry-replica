import ProjectInstance from "../models/project_instances";
import { mailSender } from "./emailServices";
import Logs from "../models/logs";
import io from "../index.js";
import bookshelf from "../db";

const knex = bookshelf.knex;

/**
 * Get all Logs
 *
 * @return {Promise}
 */
export function getAllLogs() {
  return Logs.fetchAll();
}
export const getNewDate = () => {
  let date = new Date();
  console.log(date, "getnew date+++++");
  date.setDate(date.getDate() - 7);

  return date;
};

export function getWeekelyLogs(instanceId, projectId, userId) {
  return new Logs()
    .query(queryObj => {
      queryObj
        .select(knex.raw(`logs.updated_at::date as daily`))
        .innerJoin("project_instances", {
          "logs.project_instance_id": "project_instances.id"
        })
        .innerJoin("project_admins", {
          "project_instances.project_id": "project_admins.project_id"
        })
        .innerJoin("projects", { "projects.id": "project_admins.project_id" })
        .where({ "project_admins.admin_id": userId })
        .count("logs.updated_at")
        .groupBy("daily");

      if (projectId === "all" && instanceId === "all") {
        return;
      } else if (instanceId === "all") {
        queryObj.where({ "project_instances.project_id": projectId });
      } else {
        queryObj.where({
          "logs.project_instance_id": instanceId,
          "project_instances.project_id": projectId
        });
      }
    })
    .fetchAll()
    .then(data => {
      return data;
    });
}

export function getRelatedLogs(searchQuery, rowsPerPage, page, instanceId, projectId, userId) {
  // trying to join

  console.log("searchquery:", searchQuery);
  console.log("rowsPerPage:", rowsPerPage);
  console.log("page", page);

  return new Logs()
    .query(queryObj => {
      queryObj
        .select(
          // knex.raw(`count(logs.id) as repeat, project_instances `)
          "logs.id",
          "project_instances.instance_name",
          "logs.updated_at",
          "logs.type",
          "logs.message",
          "logs.resolved",
          "logs.errorDetails",
          "projects.project_name"
        )
        .from("logs")

        .innerJoin("project_instances", {
          "logs.project_instance_id": "project_instances.id"
        })
        .innerJoin("project_admins", {
          "project_instances.project_id": "project_admins.project_id"
        })
        .innerJoin("projects", { "projects.id": "project_admins.project_id" })
        .where({ "project_admins.admin_id": userId })
        .where("logs.type", "ILIKE", "%" + searchQuery + "%");

      console.log(queryObj.toQuery());

      if (projectId === "all" && instanceId === "all") {
        return;
      } else if (instanceId === "all") {
        queryObj
          .where({ "project_instances.project_id": projectId })
          .where("logs.type", "ILIKE", "%" + searchQuery + "%");
      } else {
        queryObj
          .where({
            "logs.project_instance_id": instanceId,
            "project_instances.project_id": projectId
          })
          .where("logs.type", "ILIKE", "%" + searchQuery + "%");
      }
    })
    .fetchPage({ pageSize: rowsPerPage, page: page + 1 })

    .then(data => {
      return data;
    });
  // //
}

/**
 * Create new Log
 *
 * @param  {Object}  log
 * @return {Promise}
 */

export async function createNewLog(data) {
  const { status, statusMessage, errorDetails } = data.error;

  const { projectInstanceId, projectId } = await ProjectInstance.forge({
    instance_key: data.unique_key
  })
    .fetch()
    .then(data => {
      const projectInstanceId = data.get("id");
      const projectId = data.get("project_id");

      return { projectInstanceId, projectId };
    });

  const userEmail = await getUserEmail(projectId);
  io.to(userEmail).emit("message", "fetchdata");

  sendMail(
    "uzalstha09@gmail.com",
    userEmail,
    errorDetails.name,

    "<p style='color:red'>" +
      statusMessage +
      "</p>" +
      "<p>" +
      errorDetails.message +
      "</p>" +
      "<a href='http://localhost:3001/projects/all/project-instances/all/logs' alt='link'> See Logs </a>"
  );

  return new Logs({
    type: status,
    message: statusMessage,
    project_instance_id: projectInstanceId,
    errorDetails
  }).save();
}

function getUserEmail(projectId) {
  return new Logs()
    .query(queryObj => {
      queryObj
        .select("*")
        .from("admins")
        .innerJoin("project_admins", { "admins.id": "project_admins.admin_id" })
        .where({ "project_admins.project_id": projectId });
    })
    .fetch()
    .then(data => {
      return data.attributes.email;
    });
}
/** f
 *
 * @param {object} id
 * @param {promise} logs
 */
export async function updateLog(id) {
  const resolved = await Logs.forge({ id })
    .fetch()
    .then(data => {
      return data.attributes.resolved;
    });

  return new Logs({ id }).save({ resolved: !resolved });
}

/**
 * Delete Log.
 *
 * @param  {Number|String}  id
 * @return {Promise}
 */
export function deleteLog(id) {
  return new Logs({ id }).fetch().then(Log => Log.destroy());
}

export function sendMail(sender, receiver, subject, body) {
  return mailSender(sender, receiver, subject, body);
}
