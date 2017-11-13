import { ModuleTask } from "./ModuleTask";
import * as modular from "@alalev/modular";
import * as Orchestrator from "orchestrator";
import { TestOnlyTask } from "./TestOnlyTask";
import { BuildTask } from "./BuildTask";

export class TestTask extends ModuleTask {
   private identifier: void;

   constructor(moduleObject: modular.Module, buildTask: BuildTask,
      testOnlyTask: TestOnlyTask) {

      super(moduleObject, "test", TestTask.series(buildTask, testOnlyTask));
   }
}