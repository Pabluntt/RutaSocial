# Política de acceso: personas beneficiadas

Esta política define los permisos operativos sobre fichas de personas beneficiadas en RutaSocial.

## Roles

- **Admin**: Acceso completo a personas beneficiadas, antecedentes e información médica.
- **Voluntario**: Acceso operativo al registro, consulta y actualización de fichas. No puede eliminar.
- **Institución**: Funciona como nombre o etiqueta asociada al usuario; no define permisos por ahora.

## Permisos

| Acción | Admin | Voluntario |
|--------|-------|------------|
| Listar personas beneficiadas | Sí | Sí |
| Buscar personas por nombre/RUT | Sí | Sí |
| Ver detalle completo con RUT | Sí | Sí |
| Ver antecedentes sociales | Sí | Sí |
| Ver información médica | Sí | Sí |
| Crear persona beneficiada | Sí | Sí |
| Editar persona beneficiada | Sí | Sí |
| Agregar antecedentes | Sí | Sí |
| Agregar información médica | Sí | Sí |
| Vincular persona a punto de ayuda | Sí | Sí |
| Eliminar persona beneficiada | Sí | **No** |
| Eliminar antecedentes | Sí | **No** |
| Eliminar información médica | Sí | **No** |

## Política de privacidad

1. **Listados masivos**: Deben exponer menos datos que la ficha de detalle (solo información básica de identificación).
2. **Detalle completo**: Permitido a todos los usuarios autenticados del grupo operativo, tanto voluntarios como administradores.
3. **RUT**: Visible en listado y en ficha de detalle para todos los usuarios autenticados (decisión operativa).
4. **Antecedentes e información médica**: Visibles en la ficha de detalle para todos los usuarios autenticados.

## Reglas técnicas actuales

- Los endpoints de eliminación de personas (`DELETE /personas/:id`), antecedentes (`DELETE /personas/:id/antecedentes/:entryId`) e información médica (`DELETE /personas/:id/info-medica/:entryId`) están restringidos al rol admin a nivel de ruta.
- La creación y edición de personas, antecedentes e información médica está abierta a cualquier usuario autenticado.
- La vinculación de personas a puntos de ayuda está abierta a cualquier usuario autenticado.
- La institución no se usa para control de acceso hasta que exista una regla operativa formal.

## Justificación operativa

Los voluntarios en terreno necesitan acceso completo a la información de las personas beneficiadas para poder brindar atención adecuada. La restricción se aplica solo en acciones destructivas (eliminación) para proteger la integridad de los datos.
