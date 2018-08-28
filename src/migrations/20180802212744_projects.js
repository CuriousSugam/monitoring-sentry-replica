/**
 * @param  {object} knex
 * @return {Promise}
 */
export function up(knex) {
  return knex.schema.createTable("projects", table => {
    table.increments().primary();
    table
      .timestamp("created_at")
      .notNull()
      .defaultTo(knex.raw("now()"));
    table.timestamp("updated_at").notNull();
    table.string("project_name").notNull();
    table.string("description").defaultTo("--");
  });
}

/**
 * @param  {object} knex
 * @return {Promise}
 */
export function down(knex) {
  return knex.schema.dropTable("projects");
}
