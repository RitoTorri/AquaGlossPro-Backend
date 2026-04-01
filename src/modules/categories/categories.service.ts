import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
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
    // Validamos que el nombre no esté repetido
    const category = await this.findByName(createCategoryDto.name, createCategoryDto.type);
    if (category) throw new ConflictException('Ya existe una categoría con este nombre para el tipo seleccionado');

    const createdCategory = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(createdCategory);
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
        FROM categories
    `;
    const totalsResult = await this.categoryRepository.query(totalsQuery);
    const totals = totalsResult[0] || { total_items: 0, total_items_active: 0, total_items_inactive: 0 };

    // 2. Obtener datos paginados con filtros
    const parameters: any[] = [limit, offset, active];
    let dataQuery = `
        SELECT 
            c."categoryId",
            c.name,
            c.type,
            c.description,
            c.active
        FROM categories c
        WHERE c.active = $3
        ORDER BY c."categoryId" ASC
        LIMIT $1 OFFSET $2
    `;

    if (param && param.trim() !== '') {
      dataQuery += ` AND (c.name ILIKE $4)`;
      parameters.push(`%${param.toUpperCase()}%`);
    }

    const result = await this.categoryRepository.query(dataQuery, parameters);

    const categories = result.map((row) => ({
      categoryId: row.categoryId,
      name: row.name,
      type: row.type,
      description: row.description,
      active: row.active,
    }));

    return {
      data: categories,
      meta: {
        itemPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil((parseInt(totals.total_items) || 0) / limit),
        totals: {
          active: parseInt(totals.total_items_active) || 0,
          inactive: parseInt(totals.total_items_inactive) || 0,
          general: parseInt(totals.total_items) || 0,
        },
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

    // Validamos que el nombre no esté repetido para el tipo seleccionado
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
