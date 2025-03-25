import { router } from "../../trpc";
import { createDraftHandler } from "./crate.handler";
import { authedProcedure } from "../../procedures/auth-procedure";
import { VCreateDraftInputSchema } from "./create.schema";
import { updateDraftHandler } from "./update.handler";
import { VUpdateDraftInputSchema } from "./update.schema";
import { VSendDraftInputSchema } from "./send.schema";
import { sendDraftHandler } from "./send.handler";
import { deleteDraftHandler } from "./delete.handler";
import { VDeleteDraftInputSchema } from "./delete.schema";
import { listDraftsHandler } from "./list.handler";
import { VListDraftsInputSchema } from "./list.schema";
import { findDraftHandler } from "./find.handler";
import { VFindDraftInputSchema } from "./find.schema";

export const draftRouter = router({
  create: authedProcedure
    .input(VCreateDraftInputSchema)
    .mutation(createDraftHandler),
  update: authedProcedure
    .input(VUpdateDraftInputSchema)
    .mutation(updateDraftHandler),
  send: authedProcedure
    .input(VSendDraftInputSchema)
    .mutation(sendDraftHandler),
  delete: authedProcedure
    .input(VDeleteDraftInputSchema)
    .mutation(deleteDraftHandler),
  list: authedProcedure
  .input(VListDraftsInputSchema)
    .query(listDraftsHandler),
  find: authedProcedure
    .input(VFindDraftInputSchema)
    .query(findDraftHandler),
});
