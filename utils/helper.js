const cron = require('node-cron');
const knex = require('knex')(require('../knexfile')['development']);

const PRIORITY_TODAY = 0;
const PRIORITY_1_2_DAYS = 1;
const PRIORITY_3_4_DAYS = 2;
const PRIORITY_5_PLUS_DAYS = 3;

const calculateTaskPriority = (dueDate) => {
  const currentDate = new Date();
  const dueDateObj = new Date(dueDate);

  const timeDifference = dueDateObj.getTime() - currentDate.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

  if (daysDifference === 0) {
    return PRIORITY_TODAY;
  } else if (daysDifference >= 1 && daysDifference <= 2) {
    return PRIORITY_1_2_DAYS;
  } else if (daysDifference >= 3 && daysDifference <= 4) {
    return PRIORITY_3_4_DAYS;
  } else {
    return PRIORITY_5_PLUS_DAYS;
  }
};

// Cron job to update task priorities
cron.schedule('0 0 * * *', async () => {
  try {
    // Fetch tasks with due_date
    const tasks = await knex('tasks').whereNotNull('due_date');

    // Update priorities based on due_date
    for (const task of tasks) {
      const priority = calculateTaskPriority(task.due_date);
      await knex('tasks').where('id', task.id).update({ priority });
    }

    console.log('Task priorities updated successfully!');
  } catch (error) {
    console.error('Error updating task priorities:', error);
  }
});

module.exports = calculateTaskPriority;