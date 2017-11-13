import { CustomError } from "./CustomError";

export class ExpressError extends CustomError {
   constructor (message: string, public status: number) {
      super(message);
      this.resetPrototype(ExpressError);
   }
}