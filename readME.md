# Extensión de navegador #

-npm install
-npm run start-dev 

# Propósito #

Devolver las reseñas de determinados productos que el usuario determine

1. El usuario hace click derecho en un texto
2. Abre el context menu
3. Apreta el boton *"Buscar reseña"*
4. La extensión devuelve las reseñas disponibles.

# Archivos #

*-Background.js*
Maneja el context menu y la selección de textos del usuario

*-content.js*
Se encarga de buscar las reseñas a través del buscador del navegador

*-popup.js*
Manipula el DOM, actualiza los textos de las etiquetas semánticas

*-server.js*
Recibe información de popup.js, en un futuro va a guardar la información en colecciones.
