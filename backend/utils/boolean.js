// Utilidad para convertir diferentes entradas a booleano.
// Retorna false para valores no reconocidos para evitar activar estados por error.
const convertirABoolean = (valor) => {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') {
    const lower = valor.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'activo') return true;
    if (lower === 'false' || lower === '0' || lower === 'inactivo') return false;
  }
  if (typeof valor === 'number') return valor === 1;
  return false;
};

module.exports = { convertirABoolean };

