import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
        const existing = await this.findByName(createJobDto.name);
        if (existing) {
            throw new ConflictException('Ya existe un puesto de trabajo con ese nombre');
        }
        const job = this.jobsRepository.create(createJobDto);
        return this.jobsRepository.save(job);
    }

    async findAll(active: boolean, page: number, limit: number, param: string) {
        const where = param
            ? { active, name: ILike(`%${param.toUpperCase()}%`) }
            : { active };
        const [data, total] = await this.jobsRepository.findAndCount({
            where,
            take: limit,
            skip: (page - 1) * limit,
            order: { jobId: 'ASC' },
            withDeleted: true,
        });
        return {
            data,
            meta: {
                totalItems: total,
                itemCount: data.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            },
        };
    }

    async findOne(id: number): Promise<Job> {
        const job = await this.jobsRepository.findOne({
            where: { jobId: id },
            withDeleted: true,
        });
        if (!job) {
            throw new NotFoundException(`Puesto de trabajo con ID ${id} no encontrado`);
        }
        return job;
    }

    async update(id: number, updateJobDto: UpdateJobDto) {
        const job = await this.findOne(id);
        if (!job.active) {
            throw new ConflictException('El puesto de trabajo está inactivo');
        }
        if (updateJobDto.name) {
            const existing = await this.findByName(updateJobDto.name);
            if (existing && existing.jobId !== id) {
                throw new ConflictException('Ya existe un puesto de trabajo con ese nombre');
            }
        }
        Object.assign(job, updateJobDto);
        return this.jobsRepository.save(job);
    }

    async remove(id: number) {
        const job = await this.findOne(id);
        if (!job.active) {
            throw new ConflictException('El puesto de trabajo ya está inactivo');
        }
        job.active = false;
        job.deletedAt = new Date();
        return this.jobsRepository.save(job);
    }

    async restore(id: number) {
        const job = await this.findOne(id);
        if (job.active) {
            throw new ConflictException('El puesto de trabajo ya está activo');
        }
        job.active = true;
        job.deletedAt = null;
        return this.jobsRepository.save(job);
    }

    async findByName(name: string): Promise<Job | null> {
        return this.jobsRepository.findOne({ where: { name }, withDeleted: true });
    }

    async findById(id: number): Promise<Job | null> {
        return this.jobsRepository.findOne({ where: { jobId: id }, withDeleted: true });
    }
}