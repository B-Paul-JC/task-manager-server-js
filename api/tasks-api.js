const {
  deleteTask,
  insertTask,
  getTasksByTeamAndStatus,
} = require("../dbactions.js");

const tasksApi = (req, res) => {
  if (req.method === "POST" && req.url === "/api/tasks/create") {
    const { body } = req;
    const { title, teamId, description, priority, deadline } = body;
    if (title && teamId && priority && description && deadline) {
      insertTask(title, description, teamId, priority, deadline, res);
    } else {
      res.status(400).json({ error: "Missing required fields" });
    }
  } else if (req.method === "POST" && req.url === "/api/tasks/get") {
    const { body } = req;
    const { teamAssigned, status } = body;

    getTasksByTeamAndStatus(teamAssigned, status)
      .then((tasks) => {
        res.json({ tasks: tasks });
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });
  }
};

module.exports = {
  tasksApi,
};
