import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { typeCategories } from '../../shared/enums/types.categories.enums';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.findByName(createCategoryDto.name, createCategoryDto.type);
    if (category) throw new ConflictException('Ya existe una categoría con este nombre para el tipo seleccionado');

    const createdCategory = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(createdCategory);
  }

  async findAll(paginationDto: PaginationDto) {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .select([
        'category.categoryId',
        'category.name',
        'category.type',
        'category.description',
        'category.active',
      ])
      .withDeleted();

    if (paginationDto.active !== undefined) {
      queryBuilder.andWhere('category.active = :active', { active: paginationDto.active });
    }

    if (paginationDto.param) {
      queryBuilder.andWhere(
        '(category.name ILIKE :param OR category.type ILIKE :param)',
        { param: `%${paginationDto.param.toLowerCase()}%` }
      );
    }

    const [categories, total] = await queryBuilder
      .take(paginationDto.limit)
      .skip((paginationDto.page - 1) * paginationDto.limit)
      .orderBy('category.categoryId', 'ASC')
      .getManyAndCount();

    // Calcular conteos adicionales
    const activeCount = await this.categoryRepository.count({ where: { active: true } });
    const inactiveCount = await this.categoryRepository.count({ where: { active: false } });

    return {
      data: categories,
      meta: {
        totalItems: total,
        itemCount: categories.length,
        itemsPerPage: paginationDto.limit,
        totalPages: Math.ceil(total / paginationDto.limit),
        currentPage: paginationDto.page,
        activeCount,
        inactiveCount,
      },
    };
  }

  async restore(id: number) {
    const category = await this.findById(id);
    if (!category) throw new NotFoundException('No se encontro una categoria con el id proporcionado');
    if (category.active) throw new ConflictException('La categoria ya esta activa. No puede ser restaurada.');

    category.active = true;
    category.deletedAt = null;
    return await this.categoryRepository.save(category);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const isCategoryExistsById = await this.findById(id);
    if (!isCategoryExistsById) throw new NotFoundException('No se encontro una categoria con el id proporcionado');
    if (!isCategoryExistsById.active)
      throw new ConflictException('La categoria ya esta eliminada. No puede ser actualizada.');

    if (updateCategoryDto.name) {
      const isNameCategoryAlreadyExists = await this.findByName(updateCategoryDto.name, isCategoryExistsById.type);
      if (isNameCategoryAlreadyExists)
        throw new ConflictException('Ya existe una categoría con este nombre para el tipo seleccionado');
    }

    const updatedCategory = this.categoryRepository.merge(isCategoryExistsById, updateCategoryDto);
    return await this.categoryRepository.save(updatedCategory);
  }

  async remove(id: number) {
    const category = await this.findById(id);
    if (!category) throw new NotFoundException('No se encontro una categoria con el id proporcionado');
    if (!category.active)
      throw new ConflictException('Esta categoria ya esta eliminada. No puede ser eliminada nuevamente.');

    category.active = false;
    category.deletedAt = new Date();
    return await this.categoryRepository.save(category);
  }

  async findById(id: number) {
    return await this.categoryRepository.findOne({
      where: { categoryId: id },
      select: ['categoryId', 'name', 'type', 'description', 'active'],
      withDeleted: true,
    });
  }

  async findByName(name: string, type: typeCategories) {
    return await this.categoryRepository.findOne({
      where: { name: name, type: type },
      select: ['categoryId', 'name', 'type', 'description', 'active'],
      withDeleted: true,
    });
  }
}