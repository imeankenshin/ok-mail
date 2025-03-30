import consola from "consola";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("error", (error) => {
    consola.error(error);
  });
});
