import { Application, Request, Response, NextFunction } from "express";
import { HttpServerError } from "./errors/HttpServerError";
import { ExpressError } from "./errors/ExpressError";
import { NotFoundError } from "./errors/NotFoundError";
import * as http from "http";

export class Initializer {
   private port: number;
   private pipe: string;
   private portOrPipeString: string;

   constructor(
      private readonly app: Application,
      private readonly httpServer: http.Server
   ) {
   }

   public init(port?: string | number): void {
      let portOrPipe: string | number =
         this.initializePortOrPipe(port ? port.toString() : "80");
      this.app.set("port", portOrPipe);
      this.httpServer.listen(portOrPipe);

      this.httpServer.on("error", (error: HttpServerError): void => {
         this.handleError(error);
      });

      this.app.get("/testPage", (req: Request, res: Response): void => {
         res.status(200).send("<html>Test</html>");
      });

      this.listenTo404();
   }

   private initializePortOrPipe(value: string): string | number {
      let port: number = parseInt(value, 10);

      if (isNaN(port)) {
         this.pipe = value;
         this.portOrPipeString = "pipe " + value;
         return value;
      }

      if (port >= 0) {
         this.port = port;
         this.portOrPipeString = "port " + port;
         return port;
      }

      throw new Error(value + " is neither a port nor a pipe");
   }

   private handleError(error: HttpServerError): void {
      if (error.syscall !== "listen") {
         throw error;
      }

      switch (error.code) {
         case HttpServerError.CODE_REQUIRES_ELEVATED_PRIVILEGES:
            console.error(this.portOrPipeString + " requires elevated privileges");
            process.exit(1);
            break;
         case HttpServerError.CODE_ADDRESS_IN_USE:
            console.error(this.portOrPipeString + " is already in use");
            process.exit(1);
            break;
         default: throw error;
      }
   }

   private listenTo404(): void {
      // catch 404 and forward to error handler
      this.app.use((req: Request, res: Response, next: NextFunction): void => {
         next(new NotFoundError(req.url));
      });

      // development error handler
      // will print stacktrace
      if (this.app.get("env") === "development") {
         this.app.use((err: ExpressError, req: Request, res: Response): void => {
            res.status(err.status || 500).render("error", {
               message: err.message,
               error: err
            });
         });
      }

      // production error handler
      // no stacktraces leaked to user
      this.app.use((err: ExpressError, req: Request, res: Response): void => {
         res.status(err.status || 500).render("error", {
            message: err.message,
            error: {}
         });
      });
   }
}