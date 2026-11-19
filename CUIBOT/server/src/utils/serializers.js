/** Convierte una fila de Usuario en un objeto seguro para el cliente. */
export function usuarioPublico(usuario) {
  return {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    correo: usuario.correo,
    tipo_diabetes: usuario.tipo_diabetes,
    rol: usuario.rol,
  };
}

export function aBooleano(valor) {
  return valor === true || valor === 1 || valor === '1';
}
