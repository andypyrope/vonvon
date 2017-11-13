import { GulpTask } from "./../GulpTask";
import * as modular from "@alalev/modular";
import * as Orchestrator from "orchestrator";
import * as path from "path";
import * as gulp from "gulp";

/**
 * Module-specific task
 *
 * @export
 * @abstract
 * @class SpecificTask
 * @extends {GulpTask}
 */
export abstract class ModuleTask extends GulpTask {
   protected readonly rootDir: string;
   protected readonly sourceDir: string;
   protected readonly buildDir: string;
   protected readonly temporaryBuildDir: string;

   /**
    * Creates an instance of SpecificTask.
    *
    * @param {modular.Module} moduleObject The module this task is for
    * @param {string} taskId The ID of the task
    * @param {TaskHandler} handler The handler called when the task is executed
    * @param {...GulpTask[]} dependencies The dependencies of the task
    * @memberof SpecificTask
    */
   constructor(moduleObject: modular.Module, taskId: string,
      handler: gulp.TaskFunction) {

      super(moduleObject.id + ":" + taskId, handler);

      this.rootDir = moduleObject.directory;
      this.sourceDir = path.resolve(moduleObject.directory, "src");
      this.buildDir = path.resolve(moduleObject.directory, "dist");
      this.temporaryBuildDir = path.resolve(moduleObject.directory, "dist-tmp");
   }
}