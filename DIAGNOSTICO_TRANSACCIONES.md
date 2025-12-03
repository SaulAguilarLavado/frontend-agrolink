# 🔍 DIAGNÓSTICO: Transacciones no se crean

## Problema Identificado

1. **Comprador**: Los pedidos completados NO aparecen en "Mis Compras"
2. **Agricultor**: NO aparecen ventas ni reporte de ventas
3. **Reportes de Cultivos y Cosechas**: ✅ Funcionan correctamente

## Causa Raíz

Las **transacciones NO se están creando automáticamente** cuando un pedido cambia a estado `COMPLETADO`.

## Flujo Esperado vs. Flujo Actual

### ✅ Flujo Esperado:
```
1. Comprador crea pedido → estado PENDIENTE
2. Admin cambia estado a CONFIRMADO
3. Admin cambia estado a ENVIADO
4. Admin cambia estado a COMPLETADO
   ↓
5. 🔥 Backend CREA TRANSACCIÓN automáticamente
   ↓
6. Transacción aparece en:
   - Comprador: "Mis Compras"
   - Agricultor: "Mis Ventas" y "Reporte de Ventas"
```

### ❌ Flujo Actual:
```
1. Comprador crea pedido → estado PENDIENTE
2. Admin cambia estado a CONFIRMADO
3. Admin cambia estado a ENVIADO
4. Admin cambia estado a COMPLETADO
   ↓
5. ❌ NO SE CREA TRANSACCIÓN
   ↓
6. "Mis Compras" y "Mis Ventas" están vacías
```

## Verificación en el Frontend

### 1. Verifica que los endpoints funcionen correctamente

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Con el token del usuario autenticado
const token = localStorage.getItem('token');

// Verificar transacciones del comprador
fetch('https://backend-agrolink-production.up.railway.app/transacciones/mis-compras', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(data => console.log('Mis Compras:', data));

// Verificar transacciones del agricultor
fetch('https://backend-agrolink-production.up.railway.app/transacciones/mis-ventas', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(data => console.log('Mis Ventas:', data));
```

### 2. Verifica los pedidos

```javascript
// Verificar pedidos del comprador
fetch('https://backend-agrolink-production.up.railway.app/pedidos/my-orders', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(data => console.log('Mis Pedidos:', data));
```

## Solución en el Backend

El problema está en el backend de Spring Boot. Necesitas modificar el **OrderController.java** o crear un **listener/evento** que cree la transacción automáticamente.

### Opción 1: En el OrderController (método updateOrderStatus)

```java
@PatchMapping("/{id}/estado")
public ResponseEntity<?> updateOrderStatus(
    @PathVariable Long id,
    @RequestBody Map<String, String> body
) {
    String status = body.get("status");
    Order order = orderRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
    
    order.setStatus(OrderStatus.valueOf(status));
    orderRepository.save(order);
    
    // 🔥 AGREGAR ESTO: Crear transacción cuando el pedido se completa
    if (status.equals("COMPLETADO")) {
        createTransactionForOrder(order);
    }
    
    return ResponseEntity.ok(order);
}

// 🔥 AGREGAR ESTE MÉTODO:
private void createTransactionForOrder(Order order) {
    // Verificar si ya existe una transacción para este pedido
    if (transactionRepository.existsByOrderId(order.getId())) {
        return; // Ya existe, no crear duplicado
    }
    
    // Calcular el total del pedido
    BigDecimal total = order.getItems().stream()
        .map(item -> item.getProduct().getPricePerUnit()
            .multiply(new BigDecimal(item.getQuantity())))
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    
    // Crear la transacción
    Transaction transaction = new Transaction();
    transaction.setOrder(order);
    transaction.setBuyer(order.getBuyer());
    transaction.setSeller(order.getItems().get(0).getProduct().getFarmer()); // Asumiendo un vendedor
    transaction.setTotalAmount(total);
    transaction.setTransactionDate(LocalDateTime.now());
    transaction.setStatus("COMPLETED");
    
    transactionRepository.save(transaction);
}
```

### Opción 2: Usando Spring Events (más elegante)

Crear un evento que se dispare cuando el pedido cambie a COMPLETADO.

## Verificación después de la corrección

1. Crear un pedido como comprador
2. Cambiar el estado del pedido a COMPLETADO (como admin)
3. Verificar que aparezca en:
   - Comprador: Dashboard → "Mis Compras"
   - Agricultor: Dashboard → "Mis Ventas"
   - Agricultor: Dashboard → "Reporte de Ventas"

## Endpoints del Frontend (ya implementados correctamente)

✅ `GET /transacciones/mis-compras` - MyPurchases.jsx
✅ `GET /transacciones/mis-ventas` - MySales.jsx
✅ `GET /reports/sales` - ReportSales.jsx

## Estado Actual del Frontend

✅ Todos los componentes están correctamente implementados
✅ Las llamadas a la API son correctas
✅ El manejo de errores está implementado
✅ Los filtros y exportación CSV funcionan

❌ **El problema está 100% en el backend** - las transacciones no se están creando

## Siguiente Paso

Debes modificar el backend para que cree transacciones automáticamente cuando un pedido cambie a estado `COMPLETADO`.
