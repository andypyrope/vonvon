import { Initializer } from "./../main/Initializer";
import * as express from "express";
import * as http from "http";

describe("Initializer", (): void => {
   interface SpecScope {
      app: express.Application;
      httpServer: http.Server;
      testObject: Initializer;
      envHasBeenRequested: boolean;
      isDevelopment: boolean;
   }

   beforeEach(function (): void {
      const $s: SpecScope = this;
      $s.envHasBeenRequested = false;
      $s.isDevelopment = false;

      $s.app = jasmine.createSpyObj(["get", "set", "use"]);
      ($s.app.get as jasmine.Spy).and.callFake((parameter: any): string | void => {
         if (parameter === "env") {
            $s.envHasBeenRequested = true;
            return $s.isDevelopment ? "development" : undefined;
         }
      });

      $s.httpServer = jasmine.createSpyObj(["listen", "on"]);
      $s.testObject = new Initializer($s.app, $s.httpServer);
   });

   describe("#init", (): void => {
      it("calls the appropriate functions", function (): void {
         const $s: SpecScope = this;
         const port: number = 8000;
         $s.testObject.init(port);
         expect($s.app.set).toHaveBeenCalledWith("port", port);
         expect($s.httpServer.listen).toHaveBeenCalledWith(port);
         expect($s.httpServer.on).toHaveBeenCalledWith("error", jasmine.anything());
         expect($s.app.get).toHaveBeenCalledWith("/testPage", jasmine.anything());
         expect($s.app.get).toHaveBeenCalledWith("env");
         expect($s.app.use).toHaveBeenCalled();
      });

      describe("WHEN the it is being run in development mode", (): void => {
         it("THEN it uses an additional router for errors", function (): void {
            const $s: SpecScope = this;
            $s.isDevelopment = true;
            $s.testObject.init();
            expect($s.app.use).toHaveBeenCalledTimes(3);
         });
      });

      describe("WHEN the it is NOT being run in development mode", (): void => {
         it("THEN it does NOT use an additional router for errors", function (): void {
            const $s: SpecScope = this;
            $s.isDevelopment = false;
            $s.testObject.init();
            expect($s.app.use).toHaveBeenCalledTimes(2);
         });
      });

      describe("WHEN the process environment variable 'PORT' is not set", (): void => {
         it("THEN it makes the server listen at port 80", function (): void {
            const $s: SpecScope = this;
            $s.testObject.init();
            expect($s.httpServer.listen).toHaveBeenCalled();
            expect(($s.httpServer.listen as jasmine.Spy).calls.argsFor(0)[0]).toBe(80);
         });
      });

      describe("WHEN the process environment variable 'PORT' is set to a string", (): void => {
         it("THEN it makes the server listen at a pipe", function (): void {
            const $s: SpecScope = this;
            const pipe: string = "pipe";
            $s.testObject.init(pipe);
            expect($s.httpServer.listen).toHaveBeenCalled();
            expect(($s.httpServer.listen as jasmine.Spy).calls.argsFor(0)[0]).toBe(pipe);
         });
      });

      describe("WHEN the process environment variable 'PORT' is set to an integer", (): void => {
         it("THEN it makes the server listen at the port", function (): void {
            const $s: SpecScope = this;
            const port: number = 8811;
            $s.testObject.init(port);
            expect($s.httpServer.listen).toHaveBeenCalled();
            expect(($s.httpServer.listen as jasmine.Spy).calls.argsFor(0)[0]).toBe(port);
         });
      });

      describe("WHEN the process environment variable 'PORT' is set to a negative integer", (): void => {
         it("THEN it throws an error", function (): void {
            const $s: SpecScope = this;
            const port: number = -8811;
            expect((): void => { $s.testObject.init(port); })
               .toThrowError(port + " is neither a port nor a pipe");
         });
      });
   });
});