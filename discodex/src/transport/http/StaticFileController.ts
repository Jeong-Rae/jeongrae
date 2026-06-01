import express, { type Express } from "express";

export class StaticFileController {
  public constructor(private readonly publicPath: string) {}

  public register(app: Express): void {
    app.use(express.static(this.publicPath));
  }
}
