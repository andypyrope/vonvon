export class Colour {
   private static readonly BLUE: string = "\x1b[34m";
   private static readonly RED: string = "\x1b[31m";
   private static readonly GREEN: string = "\x1b[32m";
   private static readonly YELLOW: string = "\x1b[33m";
   private static readonly RESET: string = "\x1b[0m";
   private static readonly CYAN: string = "\x1b[36m";
   private static readonly BLINK: string = "\x1b[5m";

   private static paint(colour: string, s: string): string {
      return colour + s + Colour.RESET;
   }

   static blue(s: string): string {
      return this.paint(Colour.BLUE, s);
   }
   static red(s: string): string {
      return this.paint(Colour.RED, s);
   }
   static green(s: string): string {
      return this.paint(Colour.GREEN, s);
   }
   static yellow(s: string): string {
      return this.paint(Colour.YELLOW, s);
   }
   static cyan(s: string): string {
      return this.paint(Colour.CYAN, s);
   }
   static blink(s: string): string {
      return this.paint(Colour.BLINK, s);
   }
}