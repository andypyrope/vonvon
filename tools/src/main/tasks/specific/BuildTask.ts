import { ModuleTask } from "./ModuleTask";
import * as modular from "@alalev/modular";
import { LintTask } from "./LintTask";
import { GenerateTask } from "./GenerateTask";
import { CleanTask } from "./CleanTask";
import { RenameTask } from "./RenameTask";
import * as gulp from "gulp";

export class BuildTask extends ModuleTask {
   private identifier: void;

   constructor(moduleObject: modular.Module, lintTask: LintTask,
      generateTask: GenerateTask, cleanTask: CleanTask, renameTask: RenameTask) {

      super(moduleObject, "build", BuildTask.series(
         BuildTask.parallel(
            lintTask,
            generateTask
         ),
         cleanTask,
         renameTask
      ));
   }
}