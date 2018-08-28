import Logs from "../models/logs";
// import Projects from "../models/projects

/**
 * Get all Logs
 *
 * @return {Promise}
 */
export function getAllLogs() {
  return Logs.fetchAll();
}

export function getRelatedLogs(searchQuery, rowsPerPage, page, instanceId, projectId, userId) {
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
          "logs.errorDetails",
          "projects.project_name",
          "logs.repeat"
        )
        // .select("*")
        .from("logs")
        .innerJoin("project_instances", { "logs.project_instance_id": "project_instances.id" })
        .innerJoin("project_admins", { "project_instances.project_id": "project_admins.project_id" })
        .innerJoin("projects", { "projects.id": "project_admins.project_id" })
        .where({ "project_admins.admin_id": userId })
        .where("logs.type", "ILIKE", "%" + searchQuery + "%");
      if (projectId === "all" && instanceId === "all") {
        return;
      } else if (instanceId === "all") {
        queryObj
          .where({ "project_instances.project_id": projectId })
          .where("logs.type", "ILIKE", "%" + searchQuery + "%");
      } else {
        queryObj
          .where({ "logs.project_instance_id": instanceId, "project_instances.project_id": projectId })
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
  console.log(data);

  const result = await Logs.forge()
    .query(q => {
      q.select("*").onExist(
        function() {
          this.select("*")
            .from("logs")
            .where("logs.id", 21);
        }
        // .whereRaw("logs.id = 21")
      );
      console.log("query ", q.toQuery());
    })
    .fetchAll()
    .then(data => data)
    .catch(err => console.log("eerrrrrrrrrrrrrrrr", err));

  console.log("-------------------------------", result);

  return result;
  // const { status, statusMessage, errorDetails } = data.error;

  // const projectInstanceId = await ProjectInstance.forge({
  //   instance_key: data.unique_key
  // })
  //   .fetch()
  //   .then(data => {
  //     const pId = data.get("id");

  //     return pId;
  //   });

  // return new Logs().query(queryObj => {
  //   queryObj.column(queryObj.knex.raw().then(data => console.log(data)));
  // });

  // let dataCheck = await Logs.forge({}).fetchAll();

  // if (dataCheck.length !== 0) {
  //   dataCheck.map(async (logData, id) => {
  //     let repeat = 0;
  //     if (
  //       logData.attributes.type === status &&
  //       logData.attributes.errorDetails.message === errorDetails.message &&
  //       logData.attributes.project_instance_id === projectInstanceId
  //     ) {
  //       repeat = await Logs.forge({ id: logData.id })
  //         .fetch()
  //         .then(data => {
  //           return data.attributes.repeat;
  //         });

  //       return new Logs({ id: logData.id }).save({ repeat: repeat + 1 });
  //     } else {
  //       console.log("outside----------------------", repeat);

  //       return new Logs({
  //         type: status,
  //         message: statusMessage,
  //         project_instance_id: projectInstanceId,
  //         errorDetails
  //       }).save();
  //     }
  //   });
  // } else {
  //   console.log("outside-----------outsode-----------");

  //   return new Logs({
  //     type: status,
  //     message: statusMessage,
  //     project_instance_id: projectInstanceId,
  //     errorDetails
  //   }).save();
  // }
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

/**
 * Delete Log.
 *
 * @param  {Number|String}  id
 * @return {Promise}
 */
export function deleteLog(id) {
  return new Logs({ id }).fetch().then(Log => Log.destroy());
}
