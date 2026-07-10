import app from "./app.js";
import config from "./config/index.js";
import { logger } from "./utils/logger.js";

const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
});

process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down");
    server.close(() => {
        logger.info("Server closed");
        process.exit(0);
    });
});
