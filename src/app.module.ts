import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      // entities: [Product],
      autoLoadEntities: true,
      synchronize: true, // Cambia automaticamente las entidades si es que se modifican. En Prod: false
      charset: 'utf8mb4', // Asegura que se use UTF-8
    }),

    ProductsModule,

    CommonModule,

    SeedModule,

    FilesModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule {
  constructor(
    private readonly configService: ConfigService
  ) {}
}

