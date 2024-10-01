import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from "class-validator";


export class CreateProductDto {

  @IsString()
  @MinLength(2)
  title: string;
  
  @IsNumber()
  @IsPositive()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @MinLength(2)
  @IsOptional()
  description?: string;

  @IsString()
  @MinLength(2)
  slug?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @IsString({ each: true})
  @IsArray()
  @IsOptional()
  sizes?: string[];

  @IsIn(['men', 'women', 'kid', 'unisex'])
  @MinLength(2)
  @IsOptional()
  gender?: string;

  @IsString({ each: true})
  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString({ each: true})
  @IsArray()
  @IsOptional()
  images?: string[];

}
