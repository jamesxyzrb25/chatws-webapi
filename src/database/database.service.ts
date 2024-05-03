import { Injectable } from '@nestjs/common';
import { CompanyDB } from './company-db.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class DatabaseService {

    constructor(
        @InjectRepository(CompanyDB)
        private readonly companyDBRepository: Repository<CompanyDB>,
    ) { }

    async findOne(codCompany: number) {
        const response = await this.companyDBRepository.findOne({where:{CodEmpresa:codCompany}})
        console.log("Response query company: ",response);
        return response;
    }

    async findOneBD(bdName: string){
        const response = await this.companyDBRepository.findOne({where:{BaseDatos:bdName}})
        console.log("Response query company: ",response);
        return response;
    }
}
