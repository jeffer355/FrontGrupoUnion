export interface LoginResponse {
  token: string;
  role: string; // Añadido para la redirección basada en roles
  // Puedes añadir más propiedades aquí según la respuesta de tu backend
  // Por ejemplo:
  // userId: string;
  // email: string;
}