import { PrismaClient } from "@prisma/client";
import consola from "consola";

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
  ],
});

prisma.$on("query", (e) => {
  consola.info(`[prisma] [query]`, e);
});

export default prisma;
