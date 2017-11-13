import { ModuleTask } from "./ModuleTask";
import * as modular from "@alalev/modular";
import * as Orchestrator from "orchestrator";
import * as path from "path";
import * as gulp from "gulp";
import tslintPlugin from "gulp-tslint";

export class LintTask extends ModuleTask {
   private identifier: void;

   constructor(moduleObject: modular.Module) {
      super(moduleObject, "lint", (): Orchestrator => {
         return gulp.src(path.resolve(this.sourceDir, "**", "*.ts"))
            .pipe(tslintPlugin({ formatter: "verbose" }))
            .pipe(tslintPlugin.report());
      });
   }
}