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
  consola.log({
    tag: "Prisma",
    args: [`query=${e.query}, params=${e.params}, duration=${e.duration}`],
  });
});

export default prisma;
