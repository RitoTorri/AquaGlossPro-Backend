import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoriesService } from '../categories/categories.service';
import { typeCategories } from '../../shared/enums/types.categories.enums';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    // Validar que el nombre no exista
    const productExists = await this.findByName(createProductDto.name);
    if (productExists) {
      throw new ConflictException('Ya existe un producto con ese nombre');
    }

    // Validar que exista la categoria
    const isCategoryExist = await this.categoriesService.findById(createProductDto.categoryId);
    if (!isCategoryExist) throw new NotFoundException('La categoría no existe. Intente con otra.');
    if (!isCategoryExist.active)
      throw new ConflictException('La categoría no está activa. No puede ser asignada a este producto');
    if (isCategoryExist.type !== typeCategories.PRODUCTS)
      throw new ConflictException('La categoría seleccionada no es una de tipo productos');

    const newProduct = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(newProduct);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, active, param } = paginationDto;
    const offset = (page - 1) * limit;

    // Asegurar tipos correctos
    const limitNum = Number(limit);
    const offsetNum = Number(offset);
    const activeBool = active === true || active === 'true';

    // 1. Obtener totales globales
    const totalsQuery = `
        SELECT 
            COUNT(*) AS total_general,
            COUNT(*) FILTER(WHERE active = true) AS total_active,
            COUNT(*) FILTER(WHERE active = false) AS total_inactive
        FROM products
    `;
    const totalsResult = await this.productsRepository.query(totalsQuery);
    const globalTotals = totalsResult[0];

    // 2. Construir parámetros en el ORDEN CORRECTO
    // $1 = limit, $2 = offset, $3 = active
    const parameters: any[] = [limitNum, offsetNum, activeBool];

    // Construir la condición WHERE base
    let whereCondition = `p.active = $3`;

    // Si hay param, agregar condición de búsqueda
    if (param && param.trim() !== '') {
      whereCondition += ` AND (p.name ILIKE $4)`;
      parameters.push(`%${param.toUpperCase()}%`);
    }

    const dataQuery = `
        SELECT 
            p."productId",
            p.name,
            p."unitCostLiter",
            p."currentStock",
            p."minStock",
            p."unitType",
            p.active,
            p."createdAt",
            json_build_object(
                'categoryId', c."categoryId",
                'name', c.name,
                'type', c.type,
                'active', c.active
            ) AS category
        FROM products p
        INNER JOIN categories c ON p."categoryId" = c."categoryId"
        WHERE ${whereCondition}
        ORDER BY p."productId" ASC
        LIMIT $1 OFFSET $2
    `;

    const result = await this.productsRepository.query(dataQuery, parameters);

    const products = result.map((row) => ({
      productId: row.productId,
      name: row.name,
      unitCostLiter: parseFloat(row.unitCostLiter),
      currentStock: parseInt(row.currentStock),
      minStock: parseInt(row.minStock),
      unitType: row.unitType,
      active: row.active,
      createdAt: row.createdAt,
      category: row.category,
    }));

    return {
      data: products,
      meta: {
        itemPerPage: limitNum,
        currentPage: page,
        totalPages: paginationDto.active
          ? Math.ceil((parseInt(globalTotals.total_active) || 0) / limitNum)
          : Math.ceil((parseInt(globalTotals.total_inactive) || 0) / limitNum),
        totals: {
          general: parseInt(globalTotals.total_general) || 0,
          active: parseInt(globalTotals.total_active) || 0,
          inactive: parseInt(globalTotals.total_inactive) || 0,
        },
      },
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const productExists = await this.findById(id);
    if (!productExists) {
      throw new NotFoundException('No se encontró el producto con el ID proporcionado');
    }
    if (!productExists.active) {
      throw new ConflictException('El producto está inactivo. No puede ser actualizado');
    }

    if (updateProductDto.name) {
      const productWithSameName = await this.findByName(updateProductDto.name);
      if (productWithSameName && productWithSameName.productId !== id) {
        throw new ConflictException('Ya existe un producto con ese nombre');
      }
    }

    if (updateProductDto.categoryId) {
      const isCategoryExist = await this.categoriesService.findById(updateProductDto.categoryId);
      if (!isCategoryExist) throw new NotFoundException('La categoría no existe. Intente con otra.');
      if (!isCategoryExist.active)
        throw new ConflictException('La categoría no está activa. No puede ser asignada a este producto');
      if (isCategoryExist.type !== typeCategories.PRODUCTS)
        throw new ConflictException('La categoría seleccionada no es una de tipo productos');
    }

    const updatedProduct = this.productsRepository.merge(productExists, updateProductDto);
    return await this.productsRepository.save(updatedProduct);
  }

  async remove(id: number) {
    const productExists = await this.findById(id);
    if (!productExists) {
      throw new NotFoundException('No se encontró el producto con el ID proporcionado');
    }
    if (!productExists.active) {
      throw new ConflictException('El producto ya está inactivo');
    }

    productExists.active = false;
    productExists.deletedAt = new Date();
    return await this.productsRepository.save(productExists);
  }

  async restore(id: number) {
    const productExists = await this.findById(id);
    if (!productExists) {
      throw new NotFoundException('No se encontró el producto con el ID proporcionado');
    }
    if (productExists.active) {
      throw new ConflictException('El producto ya está activo');
    }

    productExists.active = true;
    productExists.deletedAt = null;
    return await this.productsRepository.save(productExists);
  }

  async findByName(name: string): Promise<Product | null> {
    return await this.productsRepository.findOne({
      where: { name },
      withDeleted: true,
    });
  }

  async findById(id: number): Promise<Product | null> {
    return await this.productsRepository.findOne({
      where: { productId: id },
      withDeleted: true,
    });
  }

  async incrementStock(id: number, quantity: number) {
    const product = await this.findById(id);

    if (!product) throw new NotFoundException('No existe un producto con el ID proporcionado');
    if (!product.active) throw new ConflictException('El producto no está activo. No puede ser modificado');

    product.currentStock = Number(product.currentStock) + Number(quantity);
    product.updatedAt = new Date();
    console.log(product);
    return await this.productsRepository.save(product);
  }

  async decrementStock(id: number, quantity: number) {
    const product = await this.findById(id);

    if (!product) throw new NotFoundException('No existe un producto con el ID proporcionado');
    if (!product.active) throw new ConflictException('El producto no está activo. No puede ser modificado');

    product.currentStock -= quantity;
    return await this.productsRepository.save(product);
  }
}
