import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
    // Validamos datos duplicados
    await this.findDataDuplicate(createEmployeeDto.ci, createEmployeeDto.email, createEmployeeDto.numberPhone);

    // Validamos que el puesto de trabajo exista
    const isJobExists = await this.jobsService.findById(createEmployeeDto.jobId);
    if (!isJobExists) throw new NotFoundException('No existe un puesto de trabajo con ese ID.');

    const newEmployee = this.employeeRepository.create(createEmployeeDto);
    return await this.employeeRepository.save(newEmployee);
  }

  async findEmployees(paginationDto: PaginationDto) {
    const [employees, total] = await this.employeeRepository.findAndCount({
      where: [
        { active: paginationDto.active, names: ILike(`%${paginationDto.param?.toUpperCase()}%`) },
        { active: paginationDto.active, lastnames: ILike(`%${paginationDto.param?.toUpperCase()}%`) },
        { active: paginationDto.active, ci: paginationDto.param },
      ],
      take: paginationDto.limit,
      skip: (paginationDto.page - 1) * paginationDto.limit,
      select: {
        employeeId: true,
        job: {
          jobId: true,
          name: true,
          baseSalary: true,
        },
        names: true,
        lastnames: true,
        email: true,
        numberPhone: true,
        ci: true,
        active: true,
      },
      relations: ['job'],
      order: { employeeId: 'ASC' },
      withDeleted: true,
    });

    return {
      data: employees,
      meta: {
        totalItems: total,
        itemCount: employees.length,
        itemPerPage: paginationDto.limit,
        currentPage: paginationDto.page,
        totalPages: Math.ceil(total / paginationDto.limit),
      },
    };
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const isEmployeeExists = await this.findEmployeeById(id);
    if (!isEmployeeExists) throw new NotFoundException('No existe un empleado con el ID proporcionado');
    if (!isEmployeeExists.active) throw new ConflictException('El empleado está inactivo. No puede ser actualizado');

    // Validamos datos duplicados
    await this.findDataDuplicate(updateEmployeeDto.ci, updateEmployeeDto.email, updateEmployeeDto.numberPhone, id);

    // Validamos que el puesto de trabajo exista
    if (updateEmployeeDto.jobId) {
      const isJobExists = await this.jobsService.findById(updateEmployeeDto.jobId);
      if (!isJobExists || !isJobExists.active) {
        throw new NotFoundException('No existe un puesto de trabajo con ese ID o esta inactivo.');
      }
    }

    // Actualizamos el empleado
    const updateEmployee = await this.employeeRepository.merge(isEmployeeExists, updateEmployeeDto);
    return await this.employeeRepository.save(updateEmployee);
  }

  async remove(id: number) {
    const employeeExists = await this.findEmployeeById(id);
    if (!employeeExists) throw new NotFoundException('No existe un empleado con el ID proporcionado');
    if (!employeeExists.active) throw new ConflictException('El empleado está inactivo. No puede ser eliminado');

    employeeExists.active = false;
    employeeExists.deletedAt = new Date();
    return await this.employeeRepository.save(employeeExists);
  }

  async restore(id: number) {
    const employeeExists = await this.findEmployeeById(id);
    if (!employeeExists) throw new NotFoundException('No existe un empleado con el ID proporcionado');
    if (employeeExists.active) throw new ConflictException('El empleado está activo. No puede ser restaurado');

    return await this.employeeRepository.update(id, { active: true, deletedAt: null });
  }

  async findEmployeeByCi(ci: string) {
    return await this.employeeRepository.findOne({
      where: { ci },
      select: ['employeeId', 'jobId', 'names', 'lastnames', 'email', 'numberPhone', 'ci', 'active'],
      withDeleted: true,
    });
  }

  async findEmployeeByEmail(email: string) {
    return await this.employeeRepository.findOne({
      where: { email },
      select: ['employeeId', 'jobId', 'names', 'lastnames', 'email', 'numberPhone', 'ci', 'active'],
      withDeleted: true,
    });
  }

  async findEmployeeByNumberPhone(numberPhone: string) {
    return await this.employeeRepository.findOne({
      where: { numberPhone },
      select: ['employeeId', 'jobId', 'names', 'lastnames', 'email', 'numberPhone', 'ci', 'active'],
      withDeleted: true,
    });
  }

  async findEmployeeById(id: number) {
    return await this.employeeRepository.findOne({
      where: { employeeId: id },
      select: ['employeeId', 'jobId', 'names', 'lastnames', 'email', 'numberPhone', 'ci', 'active'],
      withDeleted: true,
    });
  }

  async findDataDuplicate(
    ci: string | null = null,
    email: string | null = null,
    numberPhone: string | null = null,
    employeeIdExclude: number | null = null,
  ) {
    // Condiciones para buscar duplicados
    const whereConditions: Array<{
      ci?: string;
      email?: string;
      numberPhone?: string;
    }> = [];

    // Agregamos las condiciones para buscar duplicados
    if (ci) whereConditions.push({ ci });
    if (email) whereConditions.push({ email });
    if (numberPhone) whereConditions.push({ numberPhone });

    // Buscamos el empleado
    const employees = await this.employeeRepository.find({
      where: whereConditions,
      select: ['employeeId', 'jobId', 'names', 'lastnames', 'email', 'numberPhone', 'ci', 'active'],
      withDeleted: true,
    });

    for (const employee of employees) {
      if (employeeIdExclude && employee.employeeId === employeeIdExclude) continue;
      if (ci && employee.ci === ci) {
        throw new ConflictException('Ya existe un empleado con ese CI.');
      }
      if (email && employee.email === email) {
        throw new ConflictException('Ya existe un empleado con ese email.');
      }
      if (numberPhone && numberPhone === employee.numberPhone) {
        throw new ConflictException('Ya existe un empleado con ese número de teléfono.');
      }
    }
  }
}
