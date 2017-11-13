import * as Orchestrator from "orchestrator";
import * as gulp from "gulp";

/**
 * Represents a gulp task that has been automatically registered
 *
 * @export
 * @abstract
 * @class GulpTask
 */
export abstract class GulpTask {
   private static readonly registeredTasks: string[] = [];

   /**
    * Creates a gulp task. If it already exists or any of its dependencies do not exist,
    * an error is thrown.
    *
    * @param {string} taskId The ID of the task
    * @param {TaskHandler} handler The handler of the task
    * @param {...GulpTask[]} asyncDependencies The dependencies, all of which should
    *    already be registered
    * @memberof GulpTask
    */
   constructor(private readonly taskId: string, handler: gulp.TaskFunction) {
      if (this.getDocumentation()) {
         GulpTask.registerTask(taskId + ":help", (done: () => void): void => {
            console.log(" >> Documentation of task '" + taskId + "': " +
               this.getDocumentation() + "\n <<");
            done();
         });
      }

      GulpTask.registerTask(taskId, handler);
   }

   protected static parallel(...tasks: (GulpTask | gulp.TaskFunction)[]):
      gulp.TaskFunction {

      return gulp.parallel(GulpTask.mapTasks(tasks));
   }

   protected static series(...tasks: (GulpTask | gulp.TaskFunction)[]):
      gulp.TaskFunction {

      return gulp.series(GulpTask.mapTasks(tasks));
   }

   private static mapTasks(tasks: (GulpTask | gulp.TaskFunction)[]):
      (string | gulp.TaskFunction)[] {

      const mappedTasks: (string | gulp.TaskFunction)[] = [];
      for (let task of tasks) {
         mappedTasks.push(task instanceof GulpTask ? task.taskId : task);
      }
      return mappedTasks;
   }

   protected getDocumentation(): string {
      return "";
   }

   private static registerTask(taskId: string, handler: gulp.TaskFunction): void {

      if (GulpTask.taskExists(taskId)) {
         throw new Error("Task '" + taskId + "' already exists");
      }

      gulp.task(taskId, handler);
      GulpTask.registeredTasks.push(taskId);
   }

   private static taskExists(taskId: string): boolean {
      return GulpTask.registeredTasks.indexOf(taskId) !== -1;
   }
}