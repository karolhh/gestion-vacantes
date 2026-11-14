# Sistema de Gestión de Vacantes y Postulaciones

Proyecto final de la asignatura **Desarrollo de Aplicaciones Empresariales** de la UTS.

## Integrantes
* Karol Dayanna Hernández
* Yoseph Steven Jaimes
* Leidy Tatiana López

## Tecnologías Utilizadas
* **Backend:** Java 17, Spring Boot 4.1.1, Spring Security (JWT), Spring Data JPA, MySQL, Lombok.
* **Frontend:** ReactJS (Vite), Bootstrap 5, Axios, SweetAlert2, React Router DOM.
* **Herramientas:** DBeaver, Swagger UI, Git/GitHub.

## Arquitectura
El proyecto sigue un patrón de arquitectura en capas:
* **Backend (Puerto 9098):** Expone una API RESTful documentada con Swagger. Implementa seguridad stateless con JWT.
* **Frontend (Puerto 5173):** Single Page Application (SPA) desarrollada en React. Consume la API a través de Axios.

## Estructura del Proyecto
* `/src/main/java/...` (Código Backend)
* `/frontend` (Código Frontend en React)

## Cómo ejecutar el proyecto localmente

### 1. Base de Datos
* Crear una base de datos en MySQL llamada `gestion_vacantes`.
* Ejecutar el script `script_gestion_vacantes.sql` (ubicado en la raíz del proyecto).

### 2. Backend (Spring Boot)
* Abrir el proyecto en Spring Tool Suite (STS).
* Configurar las credenciales de MySQL en `application.properties`.
* Ejecutar la aplicación (`Run As -> Spring Boot App`). Corre en el puerto `9098`.

### 3. Frontend (React)
* Abrir una terminal en la carpeta `/frontend`.
* Ejecutar `npm install` para descargar las dependencias.
* Ejecutar `npm run dev` para iniciar Vite. Corre en el puerto `5173`.

## Credenciales de Prueba
* **Admin:** `admin@gestion.com` / `admin1234`
* **Reclutador:** `yosephreclutador@gmail.com` / `admin1234`
* **Postulante:** `Daya@gmail.com` / `admin1234`

## API Documentación
Una vez corriendo el backend, acceder a Swagger: `http://localhost:9098/swagger-ui.html`
