import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Test {
  @PrimaryKey()
  id!: number;
}
