const express = require("express");
const cors = require("cors");
const app = express();
const { teamsApi } = require("./api/teams-api.js");
const { tasksApi } = require("./api/tasks-api.js");
const { io } = require("./server.js");

// Middleware to allow cross-origin requests
app.use(cors());

// Middleware to parse JSON bodies
app.use(
  express.json({ limit: "10mb", type: "application/x-www-form-urlencoded" })
);

app.post("/api/tasks/create", tasksApi);
app.post("/api/tasks/get", tasksApi);
app.post("/api/tasks/update", tasksApi);
app.post("/api/tasks/delete", tasksApi);

app.post("/api/teams/add", teamsApi);
app.post("/api/teams/delete", teamsApi);
app.post("/api/teams/get", teamsApi);
app.post("/api/teams/all", teamsApi);

const server = require("http").createServer(app);

io.attach(server);

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
