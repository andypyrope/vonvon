import { ExpressError } from "./ExpressError";

export class NotFoundError extends ExpressError {
   static readonly STATUS: number = 404;

   constructor (url: string) {
      super("Not found: " + url, NotFoundError.STATUS);
      this.resetPrototype(NotFoundError);
   }
}