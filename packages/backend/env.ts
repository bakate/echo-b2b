import { createEnv } from "@t3-oss/env-nextjs";

import { z } from "zod";

export const env = createEnv({
  server: {
    CLERK_JWT_ISSUER_DOMAIN: z.string().min(1),
    CONVEX_URL: z.string().min(1),
    CONVEX_DEPLOYMENT: z.string().min(1),
  },
  runtimeEnv: {
    CLERK_JWT_ISSUER_DOMAIN: process.env.CLERK_JWT_ISSUER_DOMAIN,
    CONVEX_URL: process.env.CONVEX_URL,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
  },
});
