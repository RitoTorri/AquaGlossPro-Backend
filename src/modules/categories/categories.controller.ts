import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import Docs from './categories.swagger';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Docs.createCategory()
  @Post()
  @HttpCode(201)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return {
      data: category,
      message: 'Category created successfully',
    }
  }

  @Docs.findAllCategories()
  @Get()
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.categoriesService.findAll(paginationDto);
    if (result.data.length === 0) throw new NotFoundException({ data: result, message: 'Categories not found' });
    return { message: 'Categories found successfully', data: result }
  }

  @Docs.updateCategory()
  @Patch(':id')
  @HttpCode(204)
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    await this.categoriesService.update(+id, updateCategoryDto);
    return {}
  }

  @Docs.restoreCategory()
  @Patch('restore/:id')
  @HttpCode(204)
  async restore(@Param('id') id: string) {
    await this.categoriesService.restore(+id);
    return {}
  }

  @Docs.deleteCategory()
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(+id);
    return {}
  }
}
