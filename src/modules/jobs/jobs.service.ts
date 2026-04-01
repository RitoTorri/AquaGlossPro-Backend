import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Job } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  async create(createJobDto: CreateJobDto) {
    // Validar que el nombre no exista
    const jobExists = await this.findByName(createJobDto.name);
    if (jobExists) {
      throw new ConflictException('Ya existe un puesto de trabajo con ese nombre');
    }

    const newJob = this.jobsRepository.create(createJobDto);
    return await this.jobsRepository.save(newJob);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, active, param } = paginationDto;
    const offset = (page - 1) * limit;

    // 1. Obtener totales globales (sin paginación y sin filtro de active en el WHERE final)
    const totalsQuery = `
        SELECT 
            COUNT(*) AS total_items,
            COUNT(*) FILTER(WHERE active = true) AS total_items_active,
            COUNT(*) FILTER(WHERE active = false) AS total_items_inactive
        FROM jobs
    `;
    const totalsResult = await this.jobsRepository.query(totalsQuery);
    const totals = totalsResult[0] || { total_items: 0, total_items_active: 0, total_items_inactive: 0 };

    // 2. Obtener datos paginados con filtros
    const parameters: any[] = [limit, offset, active];
    let dataQuery = `
        SELECT 
            j."jobId",
            j.name,
            j."baseSalary",
            j.active,
            j."createdAt"
        FROM jobs j
        WHERE j.active = $3
        ORDER BY j."jobId" ASC
        LIMIT $1 OFFSET $2
    `;

    if (param && param.trim() !== '') {
      dataQuery += ` AND (j.name ILIKE $4)`;
      parameters.push(`%${param.toUpperCase()}%`);
    }

    const jobsRaw = await this.jobsRepository.query(dataQuery, parameters);

    const jobs = jobsRaw.map((row) => ({
      jobId: row.jobId,
      name: row.name,
      baseSalary: row.baseSalary,
      active: row.active,
      createdAt: row.createdAt,
    }));

    return {
      data: jobs,
      meta: {
        itemPerPage: limit,
        currentPage: page,
        totalPages: paginationDto.active
          ? Math.ceil((parseInt(totals.total_items_active) || 0) / limit)
          : Math.ceil((parseInt(totals.total_items_inactive) || 0) / limit),
        totals: {
          active: parseInt(totals.total_items_active) || 0,
          inactive: parseInt(totals.total_items_inactive) || 0,
          general: parseInt(totals.total_items) || 0,
        },
      },
    };
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    const jobExists = await this.findById(id);
    if (!jobExists) {
      throw new NotFoundException('No se encontró el puesto de trabajo con el ID proporcionado');
    }
    if (!jobExists.active) {
      throw new ConflictException('El puesto de trabajo está inactivo. No puede ser actualizado');
    }

    if (updateJobDto.name) {
      const jobWithSameName = await this.findByName(updateJobDto.name);
      if (jobWithSameName && jobWithSameName.jobId !== id) {
        throw new ConflictException('Ya existe un puesto de trabajo con ese nombre');
      }
    }

    const updatedJob = this.jobsRepository.merge(jobExists, updateJobDto);
    return await this.jobsRepository.save(updatedJob);
  }

  async remove(id: number) {
    const jobExists = await this.findById(id);
    if (!jobExists) {
      throw new NotFoundException('No se encontró el puesto de trabajo con el ID proporcionado');
    }
    if (!jobExists.active) {
      throw new ConflictException('El puesto de trabajo ya está inactivo');
    }

    jobExists.active = false;
    jobExists.deletedAt = new Date();
    return await this.jobsRepository.save(jobExists);
  }

  async restore(id: number) {
    const jobExists = await this.findById(id);
    if (!jobExists) {
      throw new NotFoundException('No se encontró el puesto de trabajo con el ID proporcionado');
    }
    if (jobExists.active) {
      throw new ConflictException('El puesto de trabajo ya está activo');
    }

    jobExists.active = true;
    jobExists.deletedAt = null;
    return await this.jobsRepository.save(jobExists);
  }

  async findByName(name: string): Promise<Job | null> {
    return await this.jobsRepository.findOne({
      where: { name },
      withDeleted: true,
    });
  }

  async findById(id: number): Promise<Job | null> {
    return await this.jobsRepository.findOne({
      where: { jobId: id },
      withDeleted: true,
    });
  }
}
