import { VGetEmailInputSchema } from "./get.schema";
import { getEmailsHandler } from "./get.handler";
import { VSendEmailInputSchema } from "./send.schema";
import { sendEmailHandler } from "./send.handler";
import { VTrashEmailInputSchema } from "./trash.schema";
import { trashEmailHandler } from "./trash.handler";
import { router } from "../../trpc";
import { authedProcedure } from "../../procedures/auth-procedure";
import { VMarkAsReadInputSchema } from "./mark-as-read.schema";
import { markAsReadHandler } from "./mark-as-read.handler";
import { VFindEmailInputSchema } from "./find.schema";
import { findEmailHandler } from "./find.handler";

export const emailsRouter = router({
  get: authedProcedure
    .input(VGetEmailInputSchema)
    .query(getEmailsHandler),
  send: authedProcedure
    .input(VSendEmailInputSchema)
    .mutation(sendEmailHandler),
  trash: authedProcedure
    .input(VTrashEmailInputSchema)
    .mutation(trashEmailHandler),
  markAsRead: authedProcedure
    .input(VMarkAsReadInputSchema)
    .mutation(markAsReadHandler),
  find: authedProcedure
    .input(VFindEmailInputSchema)
    .query(findEmailHandler),
});
