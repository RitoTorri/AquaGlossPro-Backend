import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class EmployeesService {
    constructor(
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>,
        private readonly jobsService: JobsService,
    ) {}

    async create(createEmployeeDto: CreateEmployeeDto) {
        const emailExists = await this.findByEmail(createEmployeeDto.email);
        if (emailExists) throw new ConflictException('Ya existe un empleado con ese email');

        const ciExists = await this.findByCi(createEmployeeDto.ci);
        if (ciExists) throw new ConflictException('Ya existe un empleado con ese CI');

        const phoneExists = await this.findByNumberPhone(createEmployeeDto.numberPhone);
        if (phoneExists) throw new ConflictException('Ya existe un empleado con ese número de teléfono');

        const jobExists = await this.jobsService.findOne(createEmployeeDto.jobId);
        if (!jobExists) throw new NotFoundException('No existe un puesto de trabajo con ese ID');

        const employee = this.employeeRepository.create(createEmployeeDto);
        return this.employeeRepository.save(employee);
    }

    async findEmployees(paginationDto: PaginationDto) {
        const { active, page, limit, param } = paginationDto;
        const where = param
            ? [
                { active, names: ILike(`%${param.toUpperCase()}%`) },
                { active, lastnames: ILike(`%${param.toUpperCase()}%`) },
                { active, ci: param },
            ]
            : { active };

        const [employees, total] = await this.employeeRepository.findAndCount({
            where,
            relations: ['job'],
            take: limit,
            skip: (page - 1) * limit,
            order: { employeeId: 'ASC' },
            withDeleted: true,
        });

        return {
            data: employees,
            meta: {
                totalItems: total,
                itemCount: employees.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            },
        };
    }

    async findOne(id: number): Promise<Employee> {
        const employee = await this.employeeRepository.findOne({
            where: { employeeId: id },
            relations: ['job'],
            withDeleted: true,
        });
        if (!employee) throw new NotFoundException('Empleado no encontrado');
        return employee;
    }

    async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
        const employee = await this.findOne(id);
        if (!employee.active) throw new ConflictException('El empleado está inactivo');

        if (updateEmployeeDto.email) {
            const emailExists = await this.findByEmail(updateEmployeeDto.email);
            if (emailExists && emailExists.employeeId !== id) {
                throw new ConflictException('Ya existe un empleado con ese email');
            }
        }
        if (updateEmployeeDto.ci) {
            const ciExists = await this.findByCi(updateEmployeeDto.ci);
            if (ciExists && ciExists.employeeId !== id) {
                throw new ConflictException('Ya existe un empleado con ese CI');
            }
        }
        if (updateEmployeeDto.numberPhone) {
            const phoneExists = await this.findByNumberPhone(updateEmployeeDto.numberPhone);
            if (phoneExists && phoneExists.employeeId !== id) {
                throw new ConflictException('Ya existe un empleado con ese teléfono');
            }
        }
        if (updateEmployeeDto.jobId) {
            await this.jobsService.findOne(updateEmployeeDto.jobId);
        }

        Object.assign(employee, updateEmployeeDto);
        return this.employeeRepository.save(employee);
    }

    async remove(id: number) {
        const employee = await this.findOne(id);
        if (!employee.active) throw new ConflictException('El empleado ya está inactivo');
        employee.active = false;
        employee.deletedAt = new Date();
        return this.employeeRepository.save(employee); // Devuelve la entidad actualizada
    }

    async restore(id: number) {
        const employee = await this.findOne(id);
        if (employee.active) throw new ConflictException('El empleado ya está activo');
        employee.active = true;
        employee.deletedAt = null;
        return this.employeeRepository.save(employee); // Devuelve la entidad actualizada
    }

    // Helpers
    async findByEmail(email: string): Promise<Employee | null> {
        return this.employeeRepository.findOne({ where: { email }, withDeleted: true });
    }

    async findByCi(ci: string): Promise<Employee | null> {
        return this.employeeRepository.findOne({ where: { ci }, withDeleted: true });
    }

    async findByNumberPhone(phone: string): Promise<Employee | null> {
        return this.employeeRepository.findOne({ where: { numberPhone: phone }, withDeleted: true });
    }
}