import { contextBridge } from "electron";

contextBridge.exposeInMainWorld(
  "skldbg",
  Object.freeze({
    platform: process.platform,
  }),
);
