const express = require('express');
const router = express.Router();  
const knex = require('knex')(require('../knexfile')['development']);
const calculateTaskPriority = require('../utils/helper');


router.get('/api/', (req, res) => {
    return res.status(201).json('Hello!!');
});
// 1. Create Task API 
router.post('/api/tasks', async (req, res) => {
  console.log(req.body);
  try {
    const { title, description, due_date } = req.body;

    if (!title || !description || !due_date) {
      return res.status(400).json({ error: 'Title, description, and due_date are required fields' });
    }

    const userId = 1;

    const priority = calculateTaskPriority(due_date);

    const [newTask] = await knex('tasks')
      .insert({
        title,
        description,
        due_date,
        priority,
        status: 'TODO',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        user_id: userId,
      })
      .returning('*');

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Create Sub Task API 
router.post('/api/subtasks', async (req, res) => {
  try {
    const { task_id } = req.body;
    if (!task_id) {
      return res.status(400).json({ error: 'Task ID is a required field' });
    }
    const userId = 1;
    // Check if the task exists in the database
    const task = await knex('tasks').where({ id: task_id, user_id: userId }).first();
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const newSubTask = {
      task_id,
      status: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    const [subtaskId] = await knex('subtasks').insert(newSubTask);
    const createdSubTask = await knex('subtasks').where('id', subtaskId).first();
    return res.status(201).json(createdSubTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
// 3. Get all task
router.get('/api/tasks', async (req, res) => {
  try {
    const { priority, due_date, page, limit } = req.query;

    const filters = {};
    if (priority) filters.priority = priority;
    if (due_date) filters.due_date = due_date;

    // For simplicity, let's assume userId is 1 (replace with your actual user ID logic)
    const userId = 1;

    // Build the initial query
    let query = knex('tasks')
      .select('*')
      .where({ user_id: userId, ...filters })
      .orderBy('due_date', 'asc');

    // Apply pagination if limit is provided
    if (limit) {
      const offset = (page - 1) * limit;
      query = query.offset(offset).limit(limit);
    }

    // Execute the query and handle results
    const userTasks = await query;

    return res.status(200).json(userTasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. Get All User Sub Tasks API (without JWT authentication)
router.get('/api/subtasks', async (req, res) => {
  try {
    const { task_id } = req.query;
    const userId = 1;
    let query = knex('subtasks')
      .select('*')
      .where('user_id', userId);
    if (task_id) {
      query = query.andWhere('task_id', task_id);
    }
    const userSubtasks = await query;
    return res.status(200).json(userSubtasks);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. Update Task API (without JWT authentication)
router.put('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { due_date, status } = req.body;

    // Validate inputs
    if (due_date && isNaN(Date.parse(due_date))) {
      return res.status(400).json({ error: 'Invalid due_date format. Use the format YYYY-MM-DD.' });
    }
    if (status && !['TODO', 'DONE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Status must be either "TODO" or "DONE".' });
    }

    // For simplicity, let's assume userId is 1 (replace with your actual user ID logic)
    const userId = 1;

    // Check if the task exists
    const task = await knex('tasks').where({ id: taskId, user_id: userId }).first();
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update task details
    const updatedTask = {};
    if (due_date) {
      updatedTask.due_date = due_date;
    }
    if (status) {
      updatedTask.status = status;
    }

    await knex('tasks')
      .where({ id: taskId, user_id: userId })
      .update(updatedTask);

    // Fetch and return the updated task
    const finalUpdatedTask = await knex('tasks').where({ id: taskId, user_id: userId }).first();

    return res.status(200).json(finalUpdatedTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 6. Update Sub Task API (without JWT authentication)

router.put('/api/subtasks/:subtaskId', async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { status } = req.body;

    if (typeof status !== 'number' || (status !== 0 && status !== 1)) {
      return res.status(400).json({ error: 'Invalid status value. Status must be either 0 or 1.' });
    }

    // For simplicity, let's assume userId is 1 (replace with your actual user ID logic)
    const userId = 1;

    // Check if the subtask exists
    const subtask = await knex('subtasks').where({ id: subtaskId, user_id: userId }).first();
    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    // Update subtask status
    await knex('subtasks')
      .where({ id: subtaskId, user_id: userId })
      .update({ status });

    const updatedSubtask = await knex('subtasks').where({ id: subtaskId, user_id: userId }).first();

    return res.status(200).json(updatedSubtask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 7. Delete Task API (without JWT authentication)
router.delete('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = 1;
    // Check if the task exists
    const task = await knex('tasks').where({ id: taskId, user_id: userId }).first();
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Soft delete the task and its associated subtasks
    await knex.transaction(async (trx) => {
      // Soft delete task
      await trx('tasks')
        .where({ id: taskId, user_id: userId })
        .update({ deleted_at: new Date().toISOString() });

      // Soft delete associated subtasks
      await trx('subtasks')
        .where({ task_id: taskId, user_id: userId })
        .update({ deleted_at: new Date().toISOString() });
    });

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 8. Delete Sub Task API (without JWT authentication)
router.delete('/api/subtasks/:subtaskId', async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const userId = 1;

    // Check if the subtask exists
    const subtaskIndex = subtasks.findIndex((st) => st.id === subtaskId && st.user_id === userId);
    if (subtaskIndex === -1) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    // Soft delete the subtask
    await knex('subtasks')
      .where({ id: subtaskId, user_id: userId })
      .update({ deleted_at: new Date().toISOString() });

    return res.status(200).json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;