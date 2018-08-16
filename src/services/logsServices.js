import ProjectInstance from "../models/project_instances";
import Logs from "../models/logs";
// import Projects from "../models/projects";

/**
 * Get all Logs
 *
 * @return {Promise}
 */
export function getAllLogs() {
  return Logs.fetchAll();
}

export function getRelatedLogs(instanceId, projectId, userId) {
  console.log("projectID-------------", projectId);
  console.log("instanceID-------------", instanceId);
  console.log("userID-------------", userId);

  // trying to join
  return new Logs()
    .query(queryObj => {
      queryObj
        .select(
          "logs.id",
          "project_instances.instance_name",
          "logs.updated_at",
          "logs.type",
          "logs.message",
          "logs.resolved",
          "projects.project_name"
        )
        // .select("*")
        .from("logs")
        .innerJoin("project_instances", { "logs.project_instance_id": "project_instances.id" })
        .innerJoin("project_admins", { "project_instances.project_id": "project_admins.project_id" })
        .innerJoin("projects", { "projects.id": "project_admins.project_id" })
        .where({ "project_admins.admin_id": userId });
      if (projectId === "all" && instanceId === "all") {
        return;
      } else if (instanceId === "all") {
        queryObj.where({ "project_instances.project_id": projectId });
      } else {
        queryObj.where({ "logs.project_instance_id": instanceId, "project_instances.project_id": projectId });
      }
      console.log(queryObj.toQuery());
    })
    .fetchAll()
    .then(data => {
      console.log("datas", data);

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
  const projectInstanceId = await ProjectInstance.forge({
    instance_key: data.unique_key
  })
    .fetch()
    .then(data => {
      const pId = data.get("id");

      return pId;
    });

  return new Logs({
    type: data.error.type,
    message: data.error.message,
    project_instance_id: projectInstanceId
  }).save();
}
/**
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
