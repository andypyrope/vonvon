import * as find from "find";
import * as fs from "fs";
import { Colour } from "./Colour";

export interface SuiteInfo {
   totalSpecsDefined: number;
}

export interface SpecStartedInfo {
   description: string;
   fullName: string;
}

export interface SpecResult {
   status: string;
   fullName: string;
   failedExpectations: Error[];
   description: string;
}

interface CompiledSpecInfo {
   name: string;
   fullName: string;
   file: string;
   errors: Error[];
   location?: string;
}

export class JasmineReporter {
   /**
    * The maximum amount of time in which no progress should be printed.
    * Once it has elapsed it is mandatory to print the progress.
    */
   private static readonly PRINT_PROGRESS_DELAY_MS: number = 1000;
   /**
    * The maximum number of percentiles between which no progress should be printed.
    * Once this distance has been reached it is mandatory to print the progress.
    */
   private static readonly PRINT_PROGRESS_DELAY_PERCENT: number = 20;
   private failedSpecs: number = 0;
   private failedE2eTests: number = 0;
   private specsToPrint: CompiledSpecInfo[] = [];
   private specsRun: number = 0;
   private e2eTestsRun: number = 0;
   private totalSpecsDefined: number = 0;
   private lastPrintedPercentile: number = 0;
   private lastPrintedProgressTime: number = Date.now();

   constructor(private readonly srcDir: string) {
   }

   private repeatString(str: string, count: number): string {
      let result: string = "";
      for (let i: number = 0; i < count; i++) {
         result += str;
      }
      return result;
   }

   jasmineStarted(suiteInfo: SuiteInfo): void {
      const HEADER_PIECE: string = this.repeatString("=", 40);
      console.log(Colour.cyan(HEADER_PIECE + "> JASMINE STARTED <" + HEADER_PIECE));
      this.totalSpecsDefined = suiteInfo.totalSpecsDefined;
   }

   specStarted(spec: SpecStartedInfo): void {
      const whenPosition: number = spec.fullName.lastIndexOf("WHEN");
      const thenPosition: number = spec.fullName.indexOf("THEN");
      let specIsOkay: boolean = false;
      if (whenPosition !== -1 && thenPosition !== -1 && thenPosition < whenPosition) {
         console.warn("Spec " + Colour.yellow(spec.fullName) +
            "' contains 'THEN' before 'WHEN' in its description");
      } else if (whenPosition !== -1 && thenPosition === -1) {
         console.warn("Spec " + Colour.yellow(spec.fullName) +
            "' contains 'WHEN' but  not 'THEN' in its description");
      } else if (whenPosition === -1 && thenPosition !== -1) {
         console.warn("Spec " + Colour.yellow(spec.fullName) +
            "' contains 'THEN' but  not 'WHEN' in its description");
      } else {
         specIsOkay = true;
      }

      if (!specIsOkay) {
         console.warn("Spec location: " + (this.findSpecLocation(
            this.getSpecFile(spec), this.srcDir, spec.fullName) || "[UNKNOWN]"));
      }
   }

   specDone(spec: SpecResult): void {
      if (spec.status === "disabled") {
         return;
      }
      this.specsRun++;
      if (this.isE2e(spec)) {
         this.e2eTestsRun++;
      }

      if (spec.failedExpectations.length) {
         this.failedSpecs++;
         if (this.isE2e(spec)) {
            this.failedE2eTests++;
         }

         const specFile: string = this.getSpecFile(spec);
         this.specsToPrint.push({
            name: spec.description,
            fullName: spec.fullName,
            file: specFile,
            errors: spec.failedExpectations,
            location: this.findSpecLocation(specFile, this.srcDir, spec.fullName)
         });
      }
      const percent: number = Math.round((this.specsRun / this.totalSpecsDefined) * 100);
      const now: number = Date.now();
      if (percent - this.lastPrintedPercentile > JasmineReporter.PRINT_PROGRESS_DELAY_PERCENT
         || now - this.lastPrintedProgressTime > JasmineReporter.PRINT_PROGRESS_DELAY_MS) {

         this.lastPrintedPercentile = percent;
         this.lastPrintedProgressTime = now;
         const failMessage: string = (this.failedSpecs > 0)
            ? (" " + this.failedSpecs + " failed")
            : "";
         const specsRunPadding: string = this.repeatString(" ",
            this.totalSpecsDefined.toString().length - this.specsRun.toString().length);
         const percentPadding: string = this.repeatString(" ",
            3 - percent.toString().length);
         console.log(specsRunPadding + this.specsRun + "/" + this.totalSpecsDefined +
            " (" + percentPadding + percent + "%)" +
            failMessage);
      }
   }

   private getSpecFile(spec: SpecStartedInfo | SpecResult): string {
      return this.isE2e(spec)
         ? spec.fullName.substr(6).match(/^[a-zA-Z]*/) + ".ts"
         : spec.fullName.match(/^[a-zA-Z]*/) + "Spec.ts";
   }

   private isE2e(spec: SpecStartedInfo | SpecResult): boolean {
      return spec.fullName.substr(0, 5) === "[E2E]";
   }

   jasmineDone(): void {
      console.log("Non-E2E specs run: " + (this.specsRun - this.e2eTestsRun));
      console.log("E2E tests run: " + this.e2eTestsRun);

      if (this.failedSpecs === 0) {
         console.log(
            Colour.green("[SUCCESS] All " + this.specsRun + " tests have passed."));
      } else {
         console.log(Colour.red("[FAILURE] A total of " + this.failedSpecs + " out of " +
            this.specsRun + " (" + Math.round(100 * this.failedSpecs / this.specsRun) +
            "%) specs have failed"));
         console.log("Among them, " + this.failedE2eTests + " are E2E tests");

         this.printSpecs(this.specsToPrint);
      }

      if (this.specsRun < this.totalSpecsDefined) {
         console.warn(Colour.blink(" !!! WARNING !!!"));
         console.warn("Only " + this.specsRun + " out of " + this.totalSpecsDefined +
            " defined specs have been run. You have either focused ('fit'/'fdescribe') " +
            "some of them or you have excluded ('xit'/'xdescribe') some.");
         // Heuristics
         let warning: string;
         if (this.specsRun < this.totalSpecsDefined / 2) {
            console.warn("Judging by how few specs have been run, they must be FOCUSED");
            warning = "Please do not submit any focused tests!";
         } else {
            console.warn("Judging by how many specs have been run, the others must be " +
               "EXCLUDED");
            warning = "Please use exclusion only as a last resort!";
         }
         console.warn(Colour.blink(warning));
      }
   }

   private printSpecs(specs: CompiledSpecInfo[]): void {
      for (let i: number = 0; i < specs.length; i++) {
         const spec: CompiledSpecInfo = specs[i];
         const HEADER_PIECE: string = this.repeatString("=", 20);
         console.log(Colour.red(HEADER_PIECE +
            " FAILURE " + (i + 1) + "/" + specs.length + " " +
            HEADER_PIECE));
         const namePrefix: string = spec.fullName.substr(0,
            spec.fullName.indexOf(spec.name));
         console.log("Spec: " + namePrefix + Colour.blue(spec.name));
         if (spec.location) {
            console.log(" ==>  " + Colour.blue(spec.location));
         }
         for (let j: number = 0; j < spec.errors.length; j++) {
            console.error(spec.errors[j].stack);
         }
      }
   }

   private potentiallyIncorrectSpec(specName: string, filePath: string): void {
      console.warn("The spec pattern may not have been followed for spec '" + specName +
         "' in file " + filePath);
   }

   private findSpecLocation(fileName: string, srcDir: string,
      specName: string): string | undefined {

      const files: string[] = find.fileSync(fileName, srcDir);
      if (files.length === 0) {
         console.warn("Could not find any source files with name " + fileName);
         return undefined;
      }
      if (files.length > 1) {
         console.warn("Found " + files.length + " spec files with name " + fileName +
            " instead of 1!");
      }

      const filePath: string = files[0];
      const fileLines: string[] = fs
         .readFileSync(filePath).toString() // #readFileSync returns Buffer, not string
         .replace("\r", "") // Just in case, get rid of CRLF line endings
         .split("\n");

      let specParts: string[] = specName.split("WHEN");
      if (specParts[0].indexOf("#") > -1) {
         // If the first part contains a '#', then there must also be #methodName in the
         // full spec name, so it should be split there as well
         specParts = specParts[0]
            .split("#")
            .concat(specParts.slice(1));

         // If the part with '#' contains more than one word separated with an interval
         // then there should be a spec right under it without a 'THEN' statement
         const sharp: string = specParts[1].trim(); // #methodName does something
         if (sharp.indexOf(" ") > -1) {
            if (specParts.length > 2) {
               // It is not allowed for a spec to have "WHEN" in its message, for example:
               // ClassName #methodName
               this.potentiallyIncorrectSpec(specName, fileName);
            }

            specParts = [
               specParts[0], // ClassName
               sharp.substr(0, sharp.indexOf(" ")), // #methodName
               sharp.substr(sharp.indexOf(" ") + 1) // does something
            ].concat(specParts.slice(2)); // this should be empty; adding it just in case
         }
      }

      if (specParts[specParts.length - 1].indexOf("THEN") > -1) {
         // Split the last spec part, which must contain "THEN"
         specParts = specParts
            .slice(0, specParts.length - 1)
            .concat(specParts[specParts.length - 1].split("THEN"));
      } else if (specParts[specParts.length - 1].indexOf("WHEN") > -1) {
         this.potentiallyIncorrectSpec(specName, fileName);
      }

      // Return the first position in the file before which all parts have been found
      let currentPart: number = 0;
      for (let i: number = 0; i < fileLines.length; i++) {
         const foundAt: number = fileLines[i].indexOf(specParts[currentPart].trim());
         if (foundAt > -1) {
            ++currentPart;

            if (currentPart === specParts.length) {
               return [filePath, i + 1, foundAt + 1].join(":");
            }
         }
      }

      // Partial failure
      console.warn("Only found " + currentPart + " parts of the spec " + specName +
         " in file " + filePath + ":");
      console.warn(specParts.slice(0, currentPart).join(" | "));
      return [filePath, 1, 1].join(":");
   }
}