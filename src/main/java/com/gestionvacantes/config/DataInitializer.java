package com.gestionvacantes.config;

import com.gestionvacantes.dao.UsuarioDao;
import com.gestionvacantes.entity.Usuario;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initAdmin(UsuarioDao usuarioDao, PasswordEncoder passwordEncoder) {
        return args -> {
            if (usuarioDao.findByEmail("admin@gestion.com").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setNombreCompleto("Admin Principal");
                admin.setEmail("admin@gestion.com");
                admin.setPassword(passwordEncoder.encode("admin1234"));
                admin.setRol(Usuario.Rol.ADMIN);
                admin.setActivo(true);

                usuarioDao.save(admin);

                System.out.println("=========================================");
                System.out.println("ADMIN INICIAL CREADO");
                System.out.println("Email:    admin@gestion.com");
                System.out.println("Password: admin1234");
                System.out.println("=========================================");
            }
        };
    }
}