const {
  insertTeam,
  deleteTeam,
  getTeam,
  getTeams,
} = require("../dbactions.js");

function generateID() {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substr(2, 10);
  const maxLength = Math.max(timestamp.length, randomString.length);
  let id = "";
  for (let i = 0; i < maxLength; i++) {
    if (timestamp[i]) id += timestamp[i];
    if (randomString[i]) id += randomString[i];
  }
  return id;
}

const teamsApi = (req, res) => {
  if (req.method === "POST" && req.url === "/api/teams/add") {
    const { body } = req;
    const { teamName, teamAddress } = body;
    const teamId = generateID();
    if (teamName && teamAddress) {
      insertTeam(teamId, teamName, teamAddress)
        .then(() => {
          res.status(201).json({ message: "Team created successfully!" });
        })
        .catch((error) => {
          res.status(500).json({ error: error.message });
        });
    } else {
      res.status(400).json({ error: "Missing required fields" });
    }
  } else if (req.method === "POST" && req.url === "/api/teams/get") {
    const { body } = req;
    const { id } = body;
    if (id) {
      getTeam(id)
        .then((team) => {
          res.json({ team });
        })
        .catch((error) => {
          res.status(404).json({ error: error.message });
        });
    } else {
      res.status(400).json({ error: "Missing required fields" });
    }
  } else if (req.method === "POST" && req.url === "/api/teams/delete") {
    const { body } = req;
    const { id } = body;
    if (id) {
      deleteTeam(id)
        .then(() => {
          res.status(200).json({ message: "Team deleted successfully!" });
        })
        .catch((error) => {
          res.status(500).json({ error: error.message });
        });
    } else {
      res.status(400).json({ error: "Missing required fields" });
    }
  } else if (req.method === "POST" && req.url === "/api/teams/all") {
    getTeams()
      .then((teams) => {
        res.json({ teams });
        console.log(teams);
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });
  }
};

module.exports = { teamsApi };
