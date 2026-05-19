export class InventoryUtils {
    private static readonly GALLON_TO_LITERS = 3.78541;
  
    /**
     * Caso: Tienes GALONES en la DB, pero gastaste LITROS.
     * @param litersToRemove Cantidad de litros usados.
     * @param currentStockGallons Lo que dice la DB en galones.
     * @returns El nuevo stock en GALONES.
     */
    static decrementLitersFromGallons(litersToRemove: number, currentStockGallons: number): number {
      // Convertimos los litros usados a su equivalente en galones
      const gallonsUsed = litersToRemove / this.GALLON_TO_LITERS;
      const newStock = currentStockGallons - gallonsUsed;
      
      // Retornamos con redondeo para evitar problemas de precisión decimal en SQL (ej: 4 decimales)
      return parseFloat(newStock.toFixed(4));
    }
  
    /**
     * Caso: Tienes LITROS en la DB, pero gastaste GALONES (ej: echaste un galón entero).
     * @param gallonsToRemove Cantidad de galones usados.
     * @param currentStockLiters Lo que dice la DB en litros.
     * @returns El nuevo stock en LITROS.
     */
    static decrementGallonsFromLiters(gallonsToRemove: number, currentStockLiters: number): number {
      // Convertimos los galones usados a litros
      const litersUsed = gallonsToRemove * this.GALLON_TO_LITERS;
      const newStock = currentStockLiters - litersUsed;
      
      return parseFloat(newStock.toFixed(4));
    }
  }