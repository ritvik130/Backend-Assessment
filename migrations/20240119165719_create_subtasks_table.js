exports.up = function(knex) {
    return knex.schema.createTable('subtasks', function (table) {
        table.increments('id').primary();
        table.integer('task_id').unsigned().references('id').inTable('tasks');
        table.integer('status').notNullable(); // 0- incomplete, 1- complete
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('subtasks');
};
