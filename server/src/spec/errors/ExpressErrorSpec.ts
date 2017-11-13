import { ExpressError } from "./../../main/errors/ExpressError";

describe("ExpressError", (): void => {
   it("is initialized properly and can be thrown", function (): void {
      const error: Error = new ExpressError("message", 100);
      expect((): void => { throw error; }).toThrow(error);
   });
});