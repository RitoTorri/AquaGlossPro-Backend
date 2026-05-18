import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { UpdateStockListDto } from './dto/update-stock-list.dto';
import { Product } from '../products/entities/product.entity';
import { TypeUnit } from '../../shared/enums/unit.type.enums';
import { InventoryUtils } from '../../shared/utils/converter_units';

@Injectable()
export class StockService {
  constructor(private readonly entityManager: EntityManager) {}

  async update(updateStockListDto: UpdateStockListDto) {
    // Iniciamos la transacción
    return await this.entityManager.transaction(async (transactionalManager) => {
      
      for (const updateStockDto of updateStockListDto.items) {
        // Buscamos el producto usando el manager de la transacción
        const product = await transactionalManager.findOne(Product, {
          where: { productId: updateStockDto.productId },
          select: ['productId', 'unitType', 'currentStock'],
        });

        if (!product) {
          throw new NotFoundException(`Producto con id: ${updateStockDto.productId} no existe`);
        }

        // Validaciones de unidad (Regla de negocio)
        if (
          product.unitType === TypeUnit.UNITS &&
          (updateStockDto.unitType === TypeUnit.GALLONS || updateStockDto.unitType === TypeUnit.LITERS)
        ) {
          throw new BadRequestException(
            `El producto con id: ${updateStockDto.productId} está almacenado por Unidades, no puedes restarle Litros o Galones`,
          );
        }

        // Cálculo del nuevo stock
        let nuevoStock: number;

        if (product.unitType === updateStockDto.unitType) {
          nuevoStock = product.currentStock - updateStockDto.stock;
        } else {
          // Lógica de conversión usando tus Utils
          nuevoStock = product.unitType === TypeUnit.GALLONS && updateStockDto.unitType === TypeUnit.LITERS
            ? InventoryUtils.decrementLitersFromGallons(updateStockDto.stock, product.currentStock)
            : InventoryUtils.decrementGallonsFromLiters(updateStockDto.stock, product.currentStock);
        }

        // Validación de stock insuficiente (Evitar negativos)
        if (nuevoStock < 0) {
          throw new BadRequestException(
            `Stock insuficiente para el producto ${product.productId}. Stock actual: ${product.currentStock}, Intento de resta: ${updateStockDto.stock} (${updateStockDto.unitType})`
          );
        }

        console.log(`${product.productId} actualizado con ${nuevoStock}`);

        // Guardar cambios usando el transactionalManager
        // Usamos update en lugar de save para mayor eficiencia en procesos masivos
        await transactionalManager.update(Product, product.productId, { 
          currentStock: nuevoStock 
        });
      }

      return { message: 'Inventario actualizado exitosamente' };
    });
  }
}