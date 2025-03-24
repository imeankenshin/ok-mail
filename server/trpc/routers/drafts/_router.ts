import { router } from "../../trpc";
import { createDraftHandler } from "./crate.handler";
import { authedProcedure } from "../../procedures/auth-procedure";
import { ZCreateDraftInputSchema } from "./create.schema";
import { updateDraftHandler } from "./update.handler";
import { ZUpdateDraftInput } from "./update.schema";
import { ZSendDraftInput } from "./send.schema";
import { sendDraftHandler } from "./send.handler";

export const draftRouter = router({
  create: authedProcedure
    .input(ZCreateDraftInputSchema)
    .mutation(createDraftHandler),
  update: authedProcedure
    .input(ZUpdateDraftInput)
    .mutation(updateDraftHandler),
  send: authedProcedure
    .input(ZSendDraftInput)
    .mutation(sendDraftHandler),
});
