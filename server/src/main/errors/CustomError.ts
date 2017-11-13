export class CustomError extends Error {
   constructor (message: string) {
      super(message);
      (this as any).__proto__ = CustomError.prototype;
   }

   protected resetPrototype(clazz: {prototype: any}): void {
      (this as any).__proto__ = clazz.prototype;
   }
}