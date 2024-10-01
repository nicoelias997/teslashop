import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";

@Entity()
export class Product {

  @PrimaryGeneratedColumn('uuid')
  id: string; 

  @Column({
    unique: true,
  })
  title: string;

  @Column({
    default: 0
  })
  price: number;

  @Column({
    type: 'text',
    nullable: true
  })
  description: string;

  @Column({
    unique: true
  })
  slug: string;

  @Column({
    type: 'int'
  })
  stock: number;

  @Column('json')
  sizes: string[]

  @Column()
  gender: string;

  @Column('json')
  tags: string[]

  @OneToMany(
    () => ProductImage, 
    (productImage) => productImage.product,
    {
      cascade: true,
      eager: true
    }
  )
  images?: ProductImage[];

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '')
      .replaceAll('"', '')
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '')
      .replaceAll('"', '')
  }
}
