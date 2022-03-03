const express = require('express')

const {Router} = express

const router = new Router()


router.get("/api/productos-test", async (req, res) => {
    try {
      res.send(await c.getFakerProducts());
    } catch (err) {
      errorLogger.error(err);
    }
  });

  router.get("/info", (req, res) => {
    let data = {
      "argumentos de entrada": process.argv.slice(2),
      "sistema opertativo": process.platform,
      "version de node": process.version,
      rss: process.memoryUsage().rss,
      path: process.execPath,
      processId: process.pid,
      "carpeta proyecto": process.cwd(),
      procesadores: numCPUs,
    };
    res.json({ data });
  });


  module.exports = router