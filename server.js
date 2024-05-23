const { Server: Io } = require("socket.io");
const {
  updateTask,
  deleteTask,
  getTasksByTeamAndStatus,
  getTeams,
  insertTask,
} = require("./dbactions");

const juicer = (choices) => {
  const index = Math.floor(Math.random() * choices.length);
  return choices[index];
};

const io = new Io({
  cors: {
    origin: "http://localhost:5173",
  },
}); // Create a new instance of the Socket.IO server

const taskChannels = [
  "PROJECTS",
  "TASKS",
  "TIMES",
  "USERS",
  "GROUPS",
  "SETTINGS",
  "ACTIVE",
]; // Object to keep track of channels and the sockets subscribed to them

io.on("connection", (socket) => {
  // Handle incoming connections
  socket.on("handshake", (data) => {
    // When a client connects, check if their handshake is valid
    const key = data.auth;
    if (!key) {
      // Invalid handshake, disconnect the client and send an error message
      socket.emit("error", { error: "Invalid handshake" });
      socket.disconnect();
      return;
    }

    socket.emit("handshake", { success: true });
    getTeams().then((result) => {
      console.log(result);
      socket.emit("teams", result);
    });
    socket.userAuth = key; // Set the user auth on the socket

    socket.on("subscribe", (data) => {
      console.log({ data });
      // When the client subscribes to a task type, add the socket from the room type
      socket.join(`${data.taskType} ${data.teamId}`.toUpperCase());
    });
    socket.on("unsubscribe", (data) => {
      // When the client unsubscribes from a task type, remove the socket from the room type
      socket.leave(`${data.taskType} ${data.teamId}`.toUpperCase());
    });
    socket.on("updateTask", ({ taskType, taskId, status }) => {
      if (taskChannels[taskType]) {
        const index = taskChannels[taskType].indexOf(taskId);
        if (index >= 0) {
          taskChannels[taskType][index].status = status;
          socket.emit("update", { count: taskChannels[taskType].length });
        }
      }
    });
    socket.on("getTasks", (data) => {
      getTasksByTeamAndStatus(data.teamId, data.taskType).then(
        (err, results) => {
          if (err) {
            return socket.emit("error", {
              error: `Error retrieving tasks: ${err.stack}`,
            });
          }
          socket.emit("tasks", results);
        }
      );
    });
    socket.on("create task", (data) => {
      insertTask(...data);
    });
  });
});

let a = setInterval(() => {
  const teamId = "l5wu7opeq4h843e19g";
  const taskType = juicer([
    "COMPLETED",
    "IN PROGRESS",
    "PENDING",
    "POSTPONED",
    "CANCELLED",
  ]);
  const choice = juicer([true, false]);

  const roomId = `${taskType} ${teamId}`.toUpperCase();
  io.to(roomId).emit("tasksUpdate", {
    new: choice,
    type: taskType.toLowerCase(),
  });
}, 3000);

function sendMessageToChannel(taskTypes, message) {
  // Send a message to all sockets subscribed to the given task types
  taskTypes.forEach((taskType) => {
    const listeners = taskChannels[taskType];
    if (listeners) {
      // Loop through all listeners in the channel and emit the message
      listeners.forEach((listener) => {
        listener.emit("message", message);
      });
    }
  });
}

module.exports = { sendMessageToChannel, io };
