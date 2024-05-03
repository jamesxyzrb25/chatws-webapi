import { Provider, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Connection, getConnection } from 'typeorm';
import { Request } from 'express';

import { CompanyDB } from './company-db.entity';

export const TENANT_CONNECTION = 'TENANT_CONNECTION';

export const DatabaseProvider: Provider = {
  provide: TENANT_CONNECTION,
  inject: [REQUEST, Connection],
  scope: Scope.REQUEST,
  useFactory: async (req: Request, connection: Connection) => {
    const CodEmpresa: number = +req.query['codCompany'];
    const company: CompanyDB = await connection
    .getRepository(CompanyDB)
    .findOne({ where: { CodEmpresa } });
    console.log("DB connect: ",company.BaseDatos);
    return getConnection(company.BaseDatos);
  },
};