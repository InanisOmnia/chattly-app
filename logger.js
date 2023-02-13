const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, printf, colorize, align, timestamp, splat } = format;
const util = require("util");

module.exports.setup = (client) => {

    const myCustomLevels = {
        levels: {
            debug: 7,
            sql: 6,
            web: 5,
            info: 4,
            automated: 3,
            warn: 2,
            error: 1,
            critical: 0
        },
        colors: {
            debug: "grey",
            sql: "grey",
            web: "grey",
            info: "white",
            automated: "lightgreen",
            warn: "yellow",
            error: "red",
            critical: "red whiteBG"
        }
    };

    winston.addColors(myCustomLevels.colors);

    const logger = createLogger({
        // lowest level is debug
        level: "debug",
        // set our custom levels
        levels: myCustomLevels.levels,
        // set custom formatting
        format: combine(
            // align all the components in the log and console
            // align(),
            // set the timestamp format
            splat(),
            timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            // print the message in this order
            printf((msg) => `${msg.timestamp} [${msg.level.toUpperCase()}]: ${msg.message}`)
        ),
        // add transports (the ways the logging message is outputted)
        transports: [
            // allow messages to go to console
            new transports.Console({
                'timestamp': true,
                format: combine(
                    colorize({ all: (function() { if (process.env.NODE_ENV == "production") { return false } else { return true } }()) })
                ),
                level: process.env.LOGGER_LVL || "debug" // (process.env.NODE_ENV == "production" ? "info" : "debug")
            }),
            // allow messages to go to this file
            new transports.File({
                filename: `./logs/${new Date().toISOString().slice(0,10)}.log`
            })
        ]
    });

    // on a warning send it to our logger
    process.on('warning', (warning) => {
        logger.warn(`${warning.code}: ${warning.name}: ${warning.message}\nStack: ${warning.stack}\nDetail: ${warning.detail}`)
    });

    // on uncaugth exceptions and unhandled promise catches log the appropriate message
    process.on("uncaughtException", (err, origin) => {
        logger.critical(`Uncaught Exception: ${err.stack}\nAt ${origin}`)
    });

    process.on('unhandledRejection', (reason, promise) => {
        logger.critical(`Unhandled Rejection at: ${util.inspect(promise, {promise: false, depth: null})}`);
    });

    return logger;
}