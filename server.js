const express = require("express");
const { WebSocketServer } = require("ws");
const path = require("path");

const PORT = process.env.PORT || 3000;

const app = express();

// public folder leveren
app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

// WebSocket signalisatielaag
const wss = new WebSocketServer({ server });

let sender = null;
let viewer = null;

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "register") {
      if (data.role === "sender") sender = ws;
      if (data.role === "viewer") viewer = ws;
    }

    if (data.type === "offer" && viewer) {
      viewer.send(JSON.stringify({ type: "offer", offer: data.offer }));
    }

    if (data.type === "answer" && sender) {
      sender.send(JSON.stringify({ type: "answer", answer: data.answer }));
    }

    if (data.type === "candidate") {
      if (ws === sender && viewer)
        viewer.send(JSON.stringify({ type: "candidate", candidate: data.candidate }));
      if (ws === viewer && sender)
        sender.send(JSON.stringify({ type: "candidate", candidate: data.candidate }));
    }
  });
});