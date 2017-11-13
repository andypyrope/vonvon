import { CustomError } from "./CustomError";

export class HttpServerError extends CustomError {
   static readonly CODE_REQUIRES_ELEVATED_PRIVILEGES: string = "EACCESS";
   static readonly CODE_ADDRESS_IN_USE: string = "EADDRINUSE";

   syscall: string;
   code: string;

   private constructor (message: string) {
      super(message);
      this.resetPrototype(HttpServerError);
   }
}