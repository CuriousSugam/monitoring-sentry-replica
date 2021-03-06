/**
 * @param  {object} knex
 * @param  {object} Promise
 * @return {Promise}
 */
export function seed(knex, Promise) {
  // Deletes all existing entries
  return knex("logs")
    .del()
    .then(() => {
      // Inserts seed entries
      return Promise.all([
        knex("logs").insert([
          {
            type: "404",
            message: "Page removed",
            updated_at: new Date(),
            project_instance_id: 1
          },
          {
            type: "401",
            message: "user is not Unauthorized",
            updated_at: new Date(),
            project_instance_id: 2
          }
        ])
      ]);
    });
}
