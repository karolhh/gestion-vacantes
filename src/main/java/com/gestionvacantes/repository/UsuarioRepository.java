package com.gestionvacantes.repository;

import com.gestionvacantes.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Usuario> findByRol(Usuario.Rol rol);

    List<Usuario> findByRolAndActivo(Usuario.Rol rol, Boolean activo);
}