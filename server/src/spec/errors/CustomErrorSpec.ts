import { CustomError } from "./../../main/errors/CustomError";

describe("CustomError", (): void => {
   it("is initialized properly and can be thrown", function (): void {
      const error: Error = new CustomError("message");
      expect((): void => { throw error; }).toThrow(error);
   });
});