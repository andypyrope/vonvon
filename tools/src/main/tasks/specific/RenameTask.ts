import { ModuleTask } from "./ModuleTask";
import * as modular from "@alalev/modular";
import * as Orchestrator from "orchestrator";
import * as gulp from "gulp";
import * as fs from "fs";

export class RenameTask extends ModuleTask {
   private identifier: void;

   constructor(moduleObject: modular.Module) {
      super(moduleObject, "rename", (done: () => void): void => {
         fs.renameSync(this.temporaryBuildDir, this.buildDir);
         done();
      });
   }
}