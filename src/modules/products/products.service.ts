import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) { }

  async create(createProductDto: CreateProductDto) {
    // Validar que el nombre no exista
    const productExists = await this.findByName(createProductDto.name);
    if (productExists) {
      throw new ConflictException('Ya existe un producto con ese nombre');
    }

    // Validar que minStock sea menor que maxStock
    if (createProductDto.minStock >= createProductDto.maxStock) {
      throw new ConflictException('El stock mínimo debe ser menor que el stock máximo');
    }

    // Validar que exista la categoria
    const isCategoryExist = await this.categoriesService.findById(createProductDto.categoryId);
    if (!isCategoryExist) throw new NotFoundException('La categoría no existe. Intente con otra.');
    if (!isCategoryExist.active) throw new ConflictException('La categoría no está activa. No puede ser asignada a este producto');

    const newProduct = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(newProduct);
  }

  async findAll(active: boolean, page: number, limit: number, param: string) {
    try {
      const where = param
        ? { active, name: ILike(`%${param.toUpperCase()}%`) }
        : { active };

      const [products, total] = await this.productsRepository.findAndCount({
        where,
        take: limit,
        skip: (page - 1) * limit,
        select: {
          productId: true,
          name: true,
          unitCostLiter: true,
          currentStock: true,
          minStock: true,
          maxStock: true,
          active: true,
          createdAt: true,
          category: { categoryId: true, name: true, active: true },
        },
        order: { productId: 'ASC' },
        relations: ['category'],
        withDeleted: true,
      });

      return {
        data: products,
        meta: {
          totalItems: total,
          itemCount: products.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      throw error;
    }
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
      if (!isCategoryExist.active) throw new ConflictException('La categoría no está activa. No puede ser asignada a este producto');
    }

    // Validar minStock y maxStock si vienen en la actualización
    const minStock = updateProductDto.minStock ?? productExists.minStock;
    const maxStock = updateProductDto.maxStock ?? productExists.maxStock;

    if (minStock >= maxStock) {
      throw new ConflictException('El stock mínimo debe ser menor que el stock máximo');
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
}