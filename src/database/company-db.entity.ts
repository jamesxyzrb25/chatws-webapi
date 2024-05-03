import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('TbEmpresa')
export class CompanyDB {
  @PrimaryColumn()
  CodEmpresa: number;

  @Column({ unique: true })
  BaseDatos: string;
}