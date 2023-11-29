import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Test {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  name: string | null = null;

  @Property()
  createdAt = new Date().toISOString();

  @Property({ onUpdate: () => new Date().toISOString() })
  updatedAt = new Date().toISOString();
}
