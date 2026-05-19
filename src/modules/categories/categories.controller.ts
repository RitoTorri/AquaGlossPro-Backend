import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
  InternalServerErrorException,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import { RolesGuard } from '../../shared/guards/permissions.guard';
import { CheckPermission } from '../../shared/decorators/permissions.decorators';
import Docs from './categories.swagger';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Docs.createCategory()
  @Post()
  @CheckPermission('C', 'CATEGORIES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @HttpCode(201)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.categoriesService.create(createCategoryDto);
      return {
        data: category,
        message: 'Category created successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.findAllCategories()
  @Get()
  @CheckPermission('R', 'CATEGORIES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const result = await this.categoriesService.findAll(paginationDto);
      return { message: 'Categories found successfully', data: result };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.updateCategory()
  @Patch(':id')
  @CheckPermission('U', 'CATEGORIES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @HttpCode(204)
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    try {
      await this.categoriesService.update(+id, updateCategoryDto);
      return {};
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.restoreCategory()
  @Patch('restore/:id')
  @CheckPermission('U', 'CATEGORIES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @HttpCode(204)
  async restore(@Param('id') id: string) {
    try {
      await this.categoriesService.restore(+id);
      return {};
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.deleteCategory()
  @Delete(':id')
  @CheckPermission('D', 'CATEGORIES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.categoriesService.remove(+id);
      return {};
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
