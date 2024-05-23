const mysql = require("mysql2");
require("dotenv").config();

/**
 * Establishes a connection to the MySQL database.
 * @param {Object} options - Options for creating a connection.
 * @param {string} options.host - The hostname of the database server.
 * @param {string} options.user - The username to use for the connection.
 * @param {string} options.password - The password to use for the connection.
 * @param {string} options.database - The name of the database to connect to.
 */
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "taskmanager",
});

/**
 * Connects to the database, calls functions to create tables and triggers, and logs any errors.
 * @param {Error} err - Error object, if any.
 */
connection.connect((err) => {
  if (err) {
    return console.error(`Error connecting to database: ${err.stack}`);
  }
  console.log(`Connected to database as id ${connection.threadId}`);
});

/**
 * Inserts a task into the "tasks" table.
 * @param {string} task - Task title.
 * @param {string} description - Task description.
 * @param {string} teamId - Team assigned to the task.
 * @param {Date | ""} deadline - optional timestamp
 * @param {'URGENT' | 'IMPORTANT' | 'MEDIUM IMPORTANCE' | 'LOW IMPORTANCE' | 'OPTIONAL'} priority  - Urgency of the given task
 * @param {'COMPLETED' | 'IN PROGRESS' | 'PENDING' | 'POSTPONED' |'DELETED'} status - Status of the task.
 */
function insertTask(
  title,
  description,
  teamId,
  priority,
  deadline = "",
  status,
  res
) {
  const sql = `
  INSERT INTO team_tasks ('tasksTitle', 'taskDescription', 'teamAssigned', 'taskStatus', 'taskPriority', 'taskCreationDate', 'taskDeadline')
  VALUES ('?','?','?','?','?','?','?')`;
  connection.query(
    sql,
    [title, description, teamId, priority, status || "PENDING", null, deadline],
    (error, results) => {
      if (error) {
        res.status(500).json({
          error: `Error Creating task`,
          message: `Please contact the developer!`,
          mysqlerror: error.message,
        });
      } else {
        res.status(201).json({ message: `Task Created Successfully!}` });
      }
    }
  );
}

/**
 * Updates a task in the "tasks" table.
 * @param {string} taskTitle
 * @param {string} taskDescription
 * @param {string} teamAssigned
 * @param {'COMPLETED' | 'IN PROGRESS' | 'PENDING' | 'POSTPONED' |'DELETED'} taskStatus
 * @param {'URGENT' | 'IMPORTANT' | 'MEDIUM IMPORTANCE' | 'LOW IMPORTANCE' | 'OPTIONAL'} taskPriority
 * @param {Date | ""} taskStartDate
 * @param {Date | ""} taskCompletionDate
 * @param {number} id
 */
function updateTask(
  taskTitle,
  taskDescription,
  teamAssigned,
  taskStatus,
  taskPriority,
  taskStartDate,
  taskCompletionDate,
  id
) {
  const sql =
    "UPDATE team_tasks SET tasksTitle = ? , taskDescription = ? , teamAssigned = ? , taskStatus = ? , taskPriority = ?, taskCreationDate = ? ,taskStartDate = ? , taskCompletionDate = ?, WHERE taskId = ?";
  connection.query(
    sql,
    [
      taskTitle,
      taskDescription,
      teamAssigned,
      taskStatus,
      taskPriority,
      taskStartDate,
      taskCompletionDate,
      id,
    ],
    (error, results) => {
      if (error) {
        return console.error(`Error updating task`);
      }
      console.log(`Task updated successfully`);
    }
  );
}

/**
 * Deletes a task from the "tasks" table.
 * @param {number} id - ID of the task to delete.
 */
function deleteTask(id) {
  const sql = "UPDATE team_tasks SET taskStatus = 'DELETED', WHERE id = ?";
  connection.query(sql, [id], (error, results) => {
    if (error) {
      return console.error(`Error deleting task: ${error.stack}`);
    }
    console.log(`Task deleted successfully with id ${id}`);
  });
}

const getTasksByTeamAndStatus = async (teamAssigned, status) => {
  const sql = `
    SELECT 'taskId', 'tasksTitle', 'taskDescription', 'teamAssigned', 'taskStartDate', 'taskCompletionDate', 'taskStatus', 'taskPriority', 'taskCreationDate', 'taskDeadline' 
    FROM tasks 
    WHERE teamAssigned = ? AND taskStatus = ? 
  `;
  const [rows] = await connection.promise().query(sql, [teamAssigned, status]);
  return rows.map((row) => ({
    taskId: row.taskId,
    taskTitle: row.taskTitle,
    taskDescription: row.taskDescription,
    teamAssigned: row.teamAssigned,
    taskStatus: row.taskStatus,
    taskCreationDate: row.taskCreationDate,
    taskStartDate: row.taskStartDate,
    taskPriority: row.taskPriority,
    taskCompletionDate: row.timeCompletionDate,
    taskDeadline: row.taskDeadline,
  }));
};

/**
 * Retrieves team information from the "teams" table.
 * @param {number} id - ID of the team to retrieve.
 */
function getTeam(id) {
  const sql = "SELECT * FROM teams WHERE id = ?";
  connection.query(sql, [id], (error, results) => {
    if (error) {
      return console.error(`Error getting team: ${error.stack}`);
    }
    return results;
  });
}

/**
 * Retrieves teamId and teamName of all teams from the "teams" table.
 */
async function getTeams() {
  const [results] = await connection
    .promise()
    .query("SELECT teamId, teamName FROM teams");
  return results;
}

/**
 * Inserts a team into the "teams" table.
 * @param {string} teamName - Name of the team.
 */
function insertTeam(teamId, teamName, teamAddress) {
  const sql =
    "INSERT INTO teams (teamId, teamName, teamAddress) VALUES (?, ?, ?)";
  connection.query(sql, [teamId, teamName, teamAddress], (error, results) => {
    if (error) {
      return console.error(`Error creating team: ${error.stack}`);
    }
    console.log(`Team created successfully!`);
  });
}

/**
 * Deletes a team from the "teams" table.
 * @param {number} id - ID of the team to delete.
 */
function deleteTeam(id) {
  const sql = "DELETE FROM teams WHERE id = ?";
  connection.query(sql, [id], (error, results) => {
    if (error) {
      return console.error(`Error deleting team: ${error.stack}`);
    }
    console.log(`Team deleted successfully with id ${id}`);
  });
}

module.exports = {
  insertTask,
  updateTask,
  deleteTask,
  getTasksByTeamAndStatus,
  insertTeam,
  deleteTeam,
  getTeams,
  getTeam,
};
