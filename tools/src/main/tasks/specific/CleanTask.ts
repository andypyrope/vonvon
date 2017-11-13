import { ModuleTask } from "./ModuleTask";
import * as modular from "@alalev/modular";
import * as Orchestrator from "orchestrator";
import * as gulp from "gulp";
import * as del from "del";

export class CleanTask extends ModuleTask {
   private identifier: void;

   constructor(moduleObject: modular.Module) {
      super(moduleObject, "clean", (done: () => void): void => {
         del([this.buildDir]).then(
            (): void => { done(); },
            (error: Error): void => { console.error(error.message); }
         );
      });
   }
}