package com.gestionvacantes.dao.impl;

import com.gestionvacantes.dao.UsuarioDao;
import com.gestionvacantes.entity.Usuario;
import com.gestionvacantes.repository.UsuarioRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class UsuarioDaoImpl implements UsuarioDao {

    private final UsuarioRepository usuarioRepository;

    public UsuarioDaoImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @Override
    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }

    @Override
    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    @Override
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    @Override
    public List<Usuario> findByRol(Usuario.Rol rol) {
        return usuarioRepository.findByRol(rol);
    }

    @Override
    public List<Usuario> findByRolAndActivo(Usuario.Rol rol, Boolean activo) {
        return usuarioRepository.findByRolAndActivo(rol, activo);
    }

    @Override
    public boolean existsByEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    @Override
    public void deleteById(Long id) {
        usuarioRepository.deleteById(id);
    }
}