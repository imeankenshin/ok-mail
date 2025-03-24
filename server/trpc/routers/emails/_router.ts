import { ZGetEmailInputSchema } from "./get.schema";
import { getEmailsHandler } from "./get.handler";
import { ZSendEmailInputSchema } from "./send.schema";
import { sendEmailHandler } from "./send.handler";
import { ZTrashEmailInputSchema } from "./trash.schema";
import { trashEmailHandler } from "./trash.handler";
import { router } from "../../trpc";
import { authedProcedure } from "../../procedures/auth-procedure";
import { ZMarkAsReadInputSchema } from "./mark-as-read.schema";
import { markAsReadHandler } from "./mark-as-read.handler";

export const emailsRouter = router({
  get: authedProcedure
    .input(ZGetEmailInputSchema)
    .query(getEmailsHandler),
  send: authedProcedure
    .input(ZSendEmailInputSchema)
    .mutation(sendEmailHandler),
  trash: authedProcedure
    .input(ZTrashEmailInputSchema)
    .mutation(trashEmailHandler),
  markAsRead: authedProcedure
    .input(ZMarkAsReadInputSchema)
    .mutation(markAsReadHandler),
});
