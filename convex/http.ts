import { httpRouter } from "convex/server";

import { auth } from "./auth";

const http = httpRouter();

// Convex Auth's token and key endpoints.
auth.addHttpRoutes(http);

export default http;
