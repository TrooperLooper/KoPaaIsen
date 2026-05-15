import { createLogger, format, transports } from "winston";

const isDev = process.env.NODE_ENV !== "production";

const logger = createLogger({
  level: isDev ? "debug" : "info",
  format: isDev
    ? format.combine(
        format.colorize(),
        format.simple()
      )
    : format.combine(
        format.timestamp(),
        format.json()
      ),
  transports: [new transports.Console()],
});

export default logger;
