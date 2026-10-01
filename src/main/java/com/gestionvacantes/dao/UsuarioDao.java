package com.gestionvacantes.dao;

import com.gestionvacantes.entity.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioDao {

    Usuario save(Usuario usuario);

    Optional<Usuario> findById(Long id);

    Optional<Usuario> findByEmail(String email);

    List<Usuario> findAll();

    List<Usuario> findByRol(Usuario.Rol rol);

    List<Usuario> findByRolAndActivo(Usuario.Rol rol, Boolean activo);

    boolean existsByEmail(String email);

    void deleteById(Long id);
}