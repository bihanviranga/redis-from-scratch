import { readCommandLineArguments } from "./config";
import { readDatabaseFile } from "./persistence/read";
import { startServer } from "./server";

function startRedis() {
  readCommandLineArguments();
  readDatabaseFile();
  startServer();
}

// Program entry point
startRedis();
