import { router } from "../../trpc";
import { createDraftHandler } from "./crate.handler";
import { authedProcedure } from "../../procedures/auth-procedure";
import { ZCreateDraftInputSchema } from "./create.schema";
import { updateDraftHandler } from "./update.handler";
import { ZUpdateDraftInput } from "./update.schema";
import { ZSendDraftInput } from "./send.schema";
import { sendDraftHandler } from "./send.handler";
import { deleteDraftHandler } from "./delete.handler";
import { ZDeleteDraftInput } from "./delete.schema";
import { listDraftsHandler } from "./list.handler";
import { ZListDraftsInput } from "./list.schema";
import { findDraftHandler } from "./find.handler";
import { ZFindDraftInput } from "./find.schema";

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
  delete: authedProcedure
    .input(ZDeleteDraftInput)
    .mutation(deleteDraftHandler),
  list: authedProcedure
  .input(ZListDraftsInput)
    .query(listDraftsHandler),
  find: authedProcedure
    .input(ZFindDraftInput)
    .query(findDraftHandler),
});
