import "./env";
import "./db";
import "./redis";
import cors from "cors";
import path from "path";
import Raven from "raven";
import helmet from "helmet";
import morgan from "morgan";
import express from "express";
import routes from "./routes";
import favicon from "serve-favicon";
import bodyParser from "body-parser";
import compression from "compression";
import json from "./middlewares/json";
import logger, { logStream } from "./utils/logger";
import * as errorHandler from "./middlewares/errorHandler";
import http from "http";
import socketIO from "socket.io";

// Initialize Raven
// https://docs.sentry.io/clients/node/integrations/express/
Raven.config(process.env.SENTRY_DSN).install();

const app = express();

const APP_PORT =
  (process.env.NODE_ENV === "test" ? process.env.TEST_APP_PORT : process.env.APP_PORT) || process.env.PORT || "3000";
const APP_HOST = process.env.APP_HOST || "0.0.0.0";

app.set("port", APP_PORT);
app.set("host", APP_HOST);
app.locals.title = process.env.APP_NAME;
app.locals.version = process.env.APP_VERSION;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization"
  );
  next();
});

// This request handler must be the first middleware on the app
app.use(Raven.requestHandler());

app.use(favicon(path.join(__dirname, "/../public", "favicon.ico")));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("tiny", { stream: logStream }));
app.use(bodyParser.json());
app.use(errorHandler.bodyParser);
app.use(json);

// Everything in the public folder is served as static content
app.use(express.static(path.join(__dirname, "/../public")));

// API Routes
app.use("/api", routes);

// This error handler must be before any other error middleware
app.use(Raven.errorHandler());

// Error Middlewares
app.use(errorHandler.genericErrorHandler);
app.use(errorHandler.methodNotAllowed);

// our server instance
const server = http.createServer(app);

const io = socketIO(server);

io.sockets.on("connection", socket => {
  socket.on("room", room => {
    socket.join(room);
  });
});

server.listen(app.get("port"), app.get("host"), () => {
  logger.info(`Server started at http://${app.get("host")}:${app.get("port")}/api`);
});

// export default app;
export default io;
