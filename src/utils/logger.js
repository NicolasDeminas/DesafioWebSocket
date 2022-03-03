const log4js = require("log4js");

log4js.configure({
  appenders: {
    consoleLog: { type: "console" },
    warnLog: { type: "file", filename: "warn.log" },
    errorLog: { type: "file", filename: "error.log" },
  },
  categories: {
    default: { appenders: ["consoleLog"], level: "info" },
    consola: { appenders: ["consoleLog"], level: "info" },
    warning: { appenders: ["warnLog"], level: "warn" },
    errors: { appenders: ["errorLog"], level: "error" },
  },
});

const infoLogger = log4js.getLogger("consola");
const warningLogger = log4js.getLogger("warning");
const errorLogger = log4js.getLogger("errors");

infoLogger.trace(`hola mundo`);

module.exports = { infoLogger, warningLogger, errorLogger };
