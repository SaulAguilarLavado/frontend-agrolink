# 🔍 DIAGNÓSTICO DE IMÁGENES - PRODUCTO KIWI

## ✅ Cambios Aplicados

### 1. Frontend - dataService.js
```javascript
formData.append('file', imageFile); // ✅ CORRECTO - coincide con backend
```

### 2. Backend - ProductController.java
```java
@RequestParam("file") MultipartFile file // ✅ Espera 'file'
```

### 3. Base de Datos
- Campo: `imagen_url` (snake_case)
- Mapeo entidad: `imagenUrl` (camelCase)
- Mapeo dominio: `imageUrl` (camelCase)

### 4. Frontend - Normalización
```javascript
// Inventory.jsx
imageUrl: p.imageUrl || p.imagenUrl || p.imagen_url || p.imagen || null

// Marketplace.jsx
{(p.imageUrl || p.imagenUrl || p.imagen_url || p.imagen) && (
```

## 🧪 PASOS DE VERIFICACIÓN

### Paso 1: Verificar en la Consola del Navegador
1. Abre DevTools (F12)
2. Ve a Network Tab
3. Crea el producto KIWI con imagen
4. Busca la petición `POST /productos/{id}/imagen`
5. Verifica:
   - ✅ Status: 200 OK
   - ✅ Response contiene la URL completa de la imagen
   - ✅ FormData contiene 'file' (no 'imagen')

### Paso 2: Verificar la Respuesta del Backend
En la consola, después de subir la imagen, deberías ver algo como:
```json
{
  "productId": 5,
  "name": "KIWI",
  "imageUrl": "http://localhost:8080/uploads/abc123-xyz.jpeg"
}
```

### Paso 3: Verificar en Base de Datos
```sql
SELECT id, nombre, imagen_url FROM productos WHERE nombre = 'KIWI';
```

Deberías ver:
```
id | nombre | imagen_url
5  | KIWI   | http://localhost:8080/uploads/abc123-xyz.jpeg
```

### Paso 4: Verificar Archivo Físico
Verifica que el archivo existe en:
```
./uploads/abc123-xyz.jpeg
```

### Paso 5: Verificar Acceso a la Imagen
Abre en el navegador:
```
http://localhost:8080/uploads/abc123-xyz.jpeg
```

## 🐛 POSIBLES PROBLEMAS

### Problema 1: La imagen no se sube
**Síntomas:** Error 400 o 500 en la petición
**Solución:** Verifica que el archivo sea .jpeg/.jpg/.png y menor a 5MB

### Problema 2: La URL está vacía en BD
**Síntomas:** `imagen_url` es NULL
**Solución:** Verifica que `FileStorageService.storeFile()` retorne la URL completa

### Problema 3: La imagen no se muestra en frontend
**Síntomas:** URL correcta en BD pero no se ve
**Solución:** 
- Verifica CORS en `WebConfig.java`
- Verifica `addResourceHandlers` en `WebConfig.java`

### Problema 4: Error 404 al acceder a la imagen
**Síntomas:** URL existe pero da 404
**Solución:** Verifica que la carpeta `uploads` existe y tiene permisos

## 📝 COMANDOS DE VERIFICACIÓN

### Ver logs del backend:
```bash
# En la consola donde corre Spring Boot, busca:
"No se pudo guardar el archivo"
"No se pudo crear el directorio"
```

### Verificar estructura:
```bash
ls -la ./uploads/
```

## 🔧 SOLUCIÓN RÁPIDA

Si todo falla, prueba esto en orden:

1. **Verificar que el producto existe:**
```javascript
// En consola del navegador
console.log('Producto KIWI:', products.find(p => p.name === 'KIWI'));
```

2. **Ver la respuesta exacta:**
```javascript
// En CreateProduct.jsx después de uploadProductImage
console.log('Response completa:', imageResponse.data);
```

3. **Forzar recarga:**
```javascript
// Limpia caché y recarga
localStorage.clear();
window.location.reload(true);
```

## ✅ CHECKLIST COMPLETO

- [ ] Producto KIWI creado correctamente (tiene ID)
- [ ] Imagen subida (petición 200 OK)
- [ ] URL guardada en BD (campo `imagen_url` no es NULL)
- [ ] Archivo existe en `./uploads/`
- [ ] Imagen accesible desde browser (http://localhost:8080/uploads/...)
- [ ] Frontend recibe `imageUrl` en el JSON
- [ ] Componente Inventory/Marketplace renderiza la imagen

## 🎯 REQUERIMIENTOS FUNCIONALES

**RF7: El agricultor debe poder publicar lotes de productos disponibles para la venta.**
- ✅ Se puede crear producto
- ✅ Se puede agregar imagen al producto
- ⚠️ **VERIFICAR:** La imagen se muestra correctamente

---

**SIGUIENTE PASO:** Ejecuta los pasos de verificación en orden y reporta en qué paso falla.
