import { UUID } from "crypto";

export class Product {
  constructor(
    public id: UUID,
    public name: string,
    public category: string,
    public price: number,
    public description: string,
    public image: string
  ) {}
}
