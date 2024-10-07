import { Controller, Get, Post, Param, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';


@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

    // 1.
      // @Post('product')
      // @UseInterceptors(FileInterceptor('file'))
      // uploadFile(@UploadedFile() file: Express.Multer.File) {
      //   console.log(file);
      //   return file;
      // }

    // 2.  
      @Post('product')
      @UseInterceptors(FileInterceptor('file', {
        // fileFilter: fileFilter,
        // limits: { fileSize: 10000},
        storage: diskStorage({
          destination: './static/uploads',
          // filename: fileNamer
        })
      }))
      uploadFileAndPassValidation(
        // @Body() body,
        @UploadedFile(
          new ParseFilePipe({
            validators: [
              new MaxFileSizeValidator({ maxSize: 100000 }),
              new FileTypeValidator(
                { fileType: '.(png|jpeg|jpg|json|txt)' }),
            ]
          })
        )
        file: Express.Multer.File,
      ) {
        const secureUrl = `${file.filename}`
        return {
          secureUrl,
          file: file.originalname
        };
      }

    @Get('product/:imageName')
    getStaticProductImage(
      @Res() res: Response,
      @Param('imageName') imageName: string){
        const path = this.filesService.getStaticProductImage(imageName);

        res.sendFile(path);
        // res.status(403).json({
        //   ok: false,
        //   path:path
        // })
      }
}
