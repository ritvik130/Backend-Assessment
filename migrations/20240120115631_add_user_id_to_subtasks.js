// New migration file for adding user_id to subtasks
exports.up = function(knex) {
    return knex.schema.table('subtasks', function(table) {
        table.integer('user_id').unsigned().references('id').inTable('users');
    });
};

exports.down = function(knex) {
    return knex.schema.table('subtasks', function(table) {
        table.dropColumn('user_id');
    });
};

