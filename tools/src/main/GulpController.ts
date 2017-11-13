import * as modular from "@alalev/modular";

import { LintTask } from "./tasks/specific/LintTask";
import { CleanTask } from "./tasks/specific/CleanTask";
import { GenerateTask } from "./tasks/specific/GenerateTask";
import { RenameTask } from "./tasks/specific/RenameTask";
import { BuildTask } from "./tasks/specific/BuildTask";

import { TestOnlyTask } from "./tasks/specific/TestOnlyTask";
import { TestTask } from "./tasks/specific/TestTask";

export class GulpController {
   constructor(private readonly root: modular.ProjectRoot) {
   }

   setupTasks(): void {
      for (let moduleObject of this.root.allModulesOfType(modular.ModuleType.SERVER)) {
         console.log("Setting up tasks for module '" + moduleObject.id + "'...");

         const buildTask: BuildTask = new BuildTask(moduleObject,
            new LintTask(moduleObject),
            new GenerateTask(moduleObject),
            new CleanTask(moduleObject),
            new RenameTask(moduleObject)
         );

         new TestTask(moduleObject,
            buildTask,
            new TestOnlyTask(moduleObject)
         );
      }
   }
}