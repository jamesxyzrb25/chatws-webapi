import { BadRequestException, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DatabaseService } from './database.service';
import {  ConfigService } from '@nestjs/config';
import { Connection, createConnection, getConnection } from 'typeorm';
import { CompanyDB } from './company-db.entity';
import { NextFunction,Request } from 'express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseProvider } from './database.provider';

@Module({
    imports:[TypeOrmModule.forFeature([CompanyDB])],
    providers: [
      DatabaseService,DatabaseProvider
    ],
  exports: [DatabaseProvider],
})
export class DatabaseModule {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(async (req: Request, res: Response, next: NextFunction) => {
        let company:CompanyDB;
        if(!isNaN(+req.query['codCompany'])){
          const codCompany: number = +req.query['codCompany'];
          company = await this.databaseService.findOne(codCompany);
        }else{
          const bd = req.query['codCompany'].toString();
          company = await this.databaseService.findOneBD(bd);
        }
        //const codCompany: number = +req.query['codCompany'];
        
        //req.codCompany = codCompany; // Opcionalmente, asigna el valor a una propiedad del objeto de solicitud para su uso posterior
        //const company: CompanyDB = await this.databaseService.findOne(codCompany);

        if (!company) {
          throw new BadRequestException(
            'Database Connection Error',
            'This tenant does not exists',
          );
        }

        try {
          console.log("CompanyBD: ",company.BaseDatos);
          getConnection(company.BaseDatos);
          next();
        } catch (e) {
          const createdConnection: Connection = await createConnection({
            name: company.BaseDatos,
            type: 'mssql',
            host: this.configService.get('DB_HOST'),
            port: +this.configService.get('DB_PORT'),
            username: this.configService.get('DB_USERNAME'),
            password: this.configService.get('DB_PASS'),
            database: company.BaseDatos,
            //entities: [__dirname + '/**/*.entity{.ts,.js}'],
            entities: [],
            synchronize: false,
            extra: {
              trustServerCertificate: true
            }
          });

          if (createdConnection) {
            next();
          } else {
            throw new BadRequestException(
              'Database Connection Error',
              'There is a Error with the Database!',
            );
          }
        }
      })
      /* .exclude(
        {path: 'routes/getCompanyRouteFC', method: RequestMethod.GET },
      ) */.forRoutes('*');
      /* .forRoutes(
        'routes/getControlsByRoute',
        'routes/getSearchRoute',
        'cars',
        'cars/getRoadMap'
      ) */
  }
}
