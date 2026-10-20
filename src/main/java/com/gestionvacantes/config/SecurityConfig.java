package com.gestionvacantes.config;

import com.gestionvacantes.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // =====================================================
    // CADENA DE FILTROS DE SEGURIDAD
    // =====================================================
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Desactivar CSRF (usamos JWT stateless)
            .csrf(csrf -> csrf.disable())

            // Configurar CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Sin sesiones HTTP (stateless con JWT)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Reglas de autorización por ruta
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/v3/api-docs/**").permitAll()
                .requestMatchers("/error").permitAll()

                // Rutas de administración (solo ADMIN)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Rutas de vacantes: Lectura para todos los autenticados, escritura para RECLUTADOR y ADMIN
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/vacantes/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/vacantes/**").hasAnyRole("RECLUTADOR", "ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/vacantes/**").hasAnyRole("RECLUTADOR", "ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/api/vacantes/**").hasAnyRole("RECLUTADOR", "ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/vacantes/**").hasAnyRole("RECLUTADOR", "ADMIN")

                // Rutas de postulaciones
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/postulaciones/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/postulaciones/**").hasAnyRole("POSTULANTE", "ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/api/postulaciones/**").hasAnyRole("RECLUTADOR", "ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/postulaciones/**").hasRole("ADMIN")

                // Rutas de postulantes (perfil y hoja de vida)
                .requestMatchers("/api/postulantes/**").hasAnyRole("POSTULANTE", "ADMIN")

                // Cualquier otra ruta requiere autenticación
                .anyRequest().authenticated()
            )

            // Agregar el filtro JWT antes del filtro de autenticación estándar
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // =====================================================
    // CONFIGURACIÓN DE CORS
    // =====================================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Orígenes permitidos (ajusta según tu frontend)
        config.setAllowedOrigins(List.of(
                "http://localhost:5500",
                "http://127.0.0.1:5500",
                "http://localhost:3000",
                "http://localhost:8080"
        ));

        // Métodos permitidos
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // Headers permitidos
        config.setAllowedHeaders(List.of("*"));

        // Permitir credenciales (cookies, Authorization header)
        config.setAllowCredentials(true);

        // Exponer headers útiles al frontend
        config.setExposedHeaders(List.of("Authorization"));

        // Tiempo de cache de la configuración CORS (1 hora)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // =====================================================
    // ENCODER DE CONTRASEÑAS (BCrypt)
    // =====================================================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}