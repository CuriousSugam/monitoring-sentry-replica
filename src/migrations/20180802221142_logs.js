/**
 * @param  {object} knex
 * @return {Promise}
 */
export function up(knex) {
  return knex.schema.createTable("logs", table => {
    table.increments();
    table
      .timestamp("created_at")
      .notNull()
      .defaultTo(knex.raw("now()"));
    table.timestamp("updated_at").notNull();
    table.string("type").notNull();
    table.string("message").notNull();
    table.json("errorDetails");
    table
      .integer("repeat")
      .notNull()
      .defaultTo(1);
    table
      .integer("project_instance_id")
      .references("project_instances.id")
      .onDelete("CASCADE");
    table.boolean("resolved").defaultTo(false);
  });
}

/**
 * @param  {object} knex
 * @return {Promise}
 */
export function down(knex) {
  return knex.schema.dropTable("logs");
}
