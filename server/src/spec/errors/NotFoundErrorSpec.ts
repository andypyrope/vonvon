import { NotFoundError } from "./../../main/errors/NotFoundError";

describe("NotFoundError", (): void => {
   it("is initialized properly and can be thrown", function (): void {
      const error: Error = new NotFoundError("url");
      expect((): void => { throw error; }).toThrow(error);
   });
});