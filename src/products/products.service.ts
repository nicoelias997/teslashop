import { BadRequestException, GoneException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID} from 'uuid'
import { ProductImage } from './entities/product-image.entity';
@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ){}
  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails} = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({url: image}))
      });
      
      await this.productRepository.save(product);
    
      return {...product, images: images};

    } catch(e){
      this.handleDBExceptions(e)
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<Product[] | null> {
    const { limit = 10, offset = 0 } = paginationDto;
    try {
      return await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true
        }
      })
      // const products = await this.productRepository.find({
      //   take: limit,
      //   skip: offset,
      //   relations: {
      //     images: true
      //   }
      // });
      // return products.map((product) => ({
      //   ...product,
      //   images: product.images.map( img => img.url )
      // }))
    } catch(e) {
      console.log(e)
      this.handleDBExceptions(e)
    }
  }

  async findOne(term: string): Promise<Product | null> {

    let product: Product;

    if (isUUID(term)){
      product = await this.productRepository.findOneBy({id: term});
    } else {
      // product = await this.productRepository.findOneBy({ slug: term.toLowerCase().trim() })
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
      .where('UPPER(title) =:title or slug =:slug', {
        title: term.toUpperCase(),
        slug: term.toLowerCase()
      })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne();
    }
      if(product) {
        return product;
      } else {
        this.handleDBNotFound(term)
      }
  }
  async update(id: string, updateProductDto: UpdateProductDto){
    const { images, ...toUpdate} = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate});

    if( !product ) return this.handleDBNotFound(id);

    if (images) {
      await this.dataSource.createQueryBuilder()
        .delete()
        .from(ProductImage)
        .where("productId = :id", {id: product.id})
        .execute();

      // Create new ProductImage entities for the updated images
      const productImages = images.map(url => this.productImageRepository.create({ url, product }));
      // Save the new images to the database
      await this.productImageRepository.save(productImages);
    } 
    const productUpdated = await this.productRepository.save(product)
    return productUpdated;
  }

  async remove(id: string){
    const product = await this.productRepository.preload({id});

    if( !product ) return this.handleDBNotFound(id);
    
     await this.dataSource.createQueryBuilder()
        .delete()
        .from(Product)
        .where("id = :id", {id : id})
        .execute();

    return `Product with id= ${id} deleted.`
  }

  async removeAll() {
    try {
      await this.dataSource.createQueryBuilder()
      .delete()
      .from(Product)
      .where({})
      .execute();
    } catch (e){
      this.handleDBExceptions(e)
    }
    
    return `All products deleleted.`
  }

  public handleDBExceptions( error: any){
    if (error.code === '23505'){
      throw new BadRequestException(error.detail)
    }
      this.logger.error(error)
      throw new InternalServerErrorException('Unexpected error, check server logs!')
  }
  private handleDBNotFound(id: string){
    throw new NotFoundException(`The product with term '${id}' does not exist.`)
  }
}
