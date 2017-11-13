import { ModuleTask } from "./ModuleTask";
import * as modular from "@alalev/modular";
import * as Orchestrator from "orchestrator";
import * as path from "path";
import * as gulp from "gulp";
import * as typescript from "gulp-typescript";
import * as sourcemaps from "gulp-sourcemaps";
import cleanDest = require("gulp-clean-dest");

export class GenerateTask extends ModuleTask {
   private identifier: void;

   constructor(moduleObject: modular.Module) {
      super(moduleObject, "gen", (): NodeJS.ReadWriteStream => {
         const tsConfigPath: string = path.join(this.rootDir, "tsconfig.json");
         const tsProject: typescript.Project = typescript.createProject(tsConfigPath, {
            declaration: true,
            typescript: require("typescript")
         });

         const result: typescript.CompileStream = tsProject.src()
            .pipe(sourcemaps.init())
            .pipe(tsProject());

         return result.js
            .pipe(sourcemaps.write(".", { sourceRoot: "." }))
            .pipe(cleanDest(this.temporaryBuildDir))
            .pipe(gulp.dest(this.temporaryBuildDir));
      });
   }
}