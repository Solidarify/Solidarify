# Solidarify

# Guía de ejecución

Previo: Debe haber creado la base de datos con nombre "solidarify", usando las sentencias SQL facilitadas en el documento
llamado "Diagrama Relacional y Modelo Físico" y en la carpeta "bbdd.sql" (todos los usuarios tienen como contraseña 123456).

1.- Clonar el proyecto a partir de la rama "main".

2.- Localizar 2 consolas, una dentro de "frontend/solidarify" (cd frontend, cd solidarify) y otra en "backend" (cd backend).

3.- Realizar en ambas consolas "npm install".

4.- En el archivo ".env" del "frontend/solidarify", cambiar la contraseña de la base de datos a la que usted tenga asignado
la base de datos creada con anterioridad (las sentencias SQL están en el documento "Diagrama Relacional y Modelo Físico").

5.- En los archivos "frontend/solidarify/src/enviroments/enviroment.prod.ts", "frontend/solidarify/src/enviroments/enviroment.ts" y 
"frontend/solidarify/capacitor.config" cambiar la dirección IP por la de su dispositivo en funcionamiento, donde tiene la app clonada.

6.- Ejecutar backend con "node app.js" y frontend con "ionic serve".

La app debería estar lista.
