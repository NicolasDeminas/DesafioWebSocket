const express = require("express");
const { fork } = require("child_process");

const { Router } = express;

const router = new Router();

router.get("/", (req, res) => {
  let repeticiones = req.query.cant || 100000000;

  const dependencies = { message: repeticiones };
  const args = [JSON.stringify(dependencies)];

  const comp = fork("./routes/generateRandomNumbers.js", args);
  comp.send("generateRandomNumber");

  comp.on("message", (data) => {
    res.send(data);
  });
});

module.exports = router;
