import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Job } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

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

  async findAll(active: boolean, page: number, limit: number, param: string) {
    const [jobs, total] = await this.jobsRepository.findAndCount({
      where: [
        { active, name: ILike(`%${param?.toUpperCase()}%`) },
        { active, description: ILike(`%${param}%`) },
      ],
      take: limit,
      skip: (page - 1) * limit,
      select: {
        jobId: true,
        name: true,
        description: true,
        active: true,
        createdAt: true,
      },
      order: { jobId: 'ASC' },
      withDeleted: true,
    });

    return {
      data: jobs,
      meta: {
        totalItems: total,
        itemCount: jobs.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
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

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
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

    return await this.jobsRepository.update(id, { active: true, deletedAt: null });
  }

  // Helper: Buscar por nombre
  async findByName(name: string) {
    return await this.jobsRepository.findOne({
      where: { name },
      withDeleted: true,
    });
  }

  // Helper: Buscar por ID
  async findById(id: number) {
    return await this.jobsRepository.findOne({
      where: { jobId: id },
      withDeleted: true,
    });
  }
}