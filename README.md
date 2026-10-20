# Sistema de Gestión de Vacantes y Postulaciones

Proyecto de la asignatura **Desarrollo de Aplicaciones Empresariales** de la UTS.

## Tecnologías utilizadas
* **Backend:** Java 17, Spring Boot, Spring Security (JWT), JPA/Hibernate, MySQL.
* **Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript Genérico (Fetch API).
* **Herramientas:** DBeaver, Swagger UI, Postman, Git.

## Integrantes y Roles
* **Karol Hernández:** Módulo Administrador + Seguridad JWT.
* **Yoseph Jaimes:** Módulo Reclutador (CRUD Vacantes).
* **Tatiana López:** Módulo Postulante (CRUD Postulaciones y Perfil).

## Cómo ejecutar el proyecto
1. Clonar el repositorio.
2. Crear la base de datos en MySQL ejecutando el script `script_gestion_vacantes.sql` (adjunto en el repositorio).
3. Abrir el backend en Spring Tool Suite (STS) y configurar las credenciales de MySQL en `application.properties`.
4. Ejecutar la aplicación.
5. Abrir la carpeta `frontend` en Visual Studio Code y ejecutar `login.html` con Live Server.

## Documentación de la API
El proyecto cuenta con Swagger UI. Una vez ejecutado el backend, acceder a: `http://localhost:9098/swagger-ui.html`
