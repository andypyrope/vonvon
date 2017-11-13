import { ModuleTask } from "./ModuleTask";
import * as modular from "@alalev/modular";
import * as Orchestrator from "orchestrator";
import * as path from "path";
import * as gulp from "gulp";
import jasmine = require("gulp-jasmine");
import { JasmineReporter } from "./../../JasmineReporter";

export class TestOnlyTask extends ModuleTask {
   private identifier: void;

   constructor(moduleObject: modular.Module) {
      super(moduleObject, "test-only", (): NodeJS.ReadWriteStream => {
         return gulp.src(path.resolve(this.buildDir, "spec", "**", "*.js"))
            .pipe(jasmine({ reporter: new JasmineReporter(this.sourceDir) }));
      });
   }
}