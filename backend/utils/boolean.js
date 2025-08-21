// Utility to convert various input types to boolean
function convertirABoolean(valor) {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') {
    const lower = valor.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'activo') return true;
    if (lower === 'false' || lower === '0' || lower === 'inactivo') return false;
  }
  if (typeof valor === 'number') {
    if (valor === 0) return false;
    if (valor === 1) return true;
  }
  return true;
}

module.exports = { convertirABoolean };
