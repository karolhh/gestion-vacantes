package com.gestionvacantes.service;

import com.gestionvacantes.dao.UsuarioDao;
import com.gestionvacantes.dto.UsuarioRequest;
import com.gestionvacantes.dto.UsuarioResponse;
import com.gestionvacantes.entity.Usuario;
import com.gestionvacantes.exception.EmailYaExisteException;
import com.gestionvacantes.exception.OperacionNoPermitidaException;
import com.gestionvacantes.exception.RecursoNoEncontradoException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioDao usuarioDao;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioDao usuarioDao, PasswordEncoder passwordEncoder) {
        this.usuarioDao = usuarioDao;
        this.passwordEncoder = passwordEncoder;
    }

    // =====================================================
    // LISTAR TODOS LOS RECLUTADORES
    // =====================================================
    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarReclutadores() {
        return usuarioDao.findByRol(Usuario.Rol.RECLUTADOR)
                .stream()
                .map(UsuarioResponse::new)
                .toList();
    }

    // =====================================================
    // LISTAR RECLUTADORES ACTIVOS
    // =====================================================
    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarReclutadoresActivos() {
        return usuarioDao.findByRolAndActivo(Usuario.Rol.RECLUTADOR, true)
                .stream()
                .map(UsuarioResponse::new)
                .toList();
    }

    // =====================================================
    // BUSCAR RECLUTADOR POR ID
    // =====================================================
    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Long id) {
        Usuario usuario = usuarioDao.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id));

        if (usuario.getRol() != Usuario.Rol.RECLUTADOR) {
            throw new RecursoNoEncontradoException("El usuario con id " + id + " no es un reclutador");
        }

        return new UsuarioResponse(usuario);
    }

    // =====================================================
    // CREAR RECLUTADOR
    // =====================================================
    @Transactional
    public UsuarioResponse crearReclutador(UsuarioRequest request) {

        if (usuarioDao.existsByEmail(request.getEmail())) {
            throw new EmailYaExisteException("El email ya está registrado: " + request.getEmail());
        }

        Usuario usuario = new Usuario();
        usuario.setNombreCompleto(request.getNombreCompleto());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setTelefono(request.getTelefono());
        usuario.setDireccion(request.getDireccion());
        usuario.setDepartamento(request.getDepartamento());
        usuario.setRol(Usuario.Rol.RECLUTADOR);
        usuario.setActivo(true);

        Usuario guardado = usuarioDao.save(usuario);
        return new UsuarioResponse(guardado);
    }

    // =====================================================
    // ACTUALIZAR RECLUTADOR
    // =====================================================
    @Transactional
    public UsuarioResponse actualizarReclutador(Long id, UsuarioRequest request) {

        Usuario usuario = usuarioDao.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id));

        if (usuario.getRol() != Usuario.Rol.RECLUTADOR) {
            throw new OperacionNoPermitidaException("Solo se pueden actualizar usuarios con rol RECLUTADOR");
        }

        if (!usuario.getEmail().equals(request.getEmail())
                && usuarioDao.existsByEmail(request.getEmail())) {
            throw new EmailYaExisteException("El email ya está registrado: " + request.getEmail());
        }

        usuario.setNombreCompleto(request.getNombreCompleto());
        usuario.setEmail(request.getEmail());
        usuario.setTelefono(request.getTelefono());
        usuario.setDireccion(request.getDireccion());
        usuario.setDepartamento(request.getDepartamento());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getActivo() != null) {
            usuario.setActivo(request.getActivo());
        }

        Usuario actualizado = usuarioDao.save(usuario);
        return new UsuarioResponse(actualizado);
    }

    // =====================================================
    // DESHABILITAR RECLUTADOR (soft delete)
    // =====================================================
    @Transactional
    public UsuarioResponse deshabilitarReclutador(Long id) {

        Usuario usuario = usuarioDao.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id));

        if (usuario.getRol() != Usuario.Rol.RECLUTADOR) {
            throw new OperacionNoPermitidaException("Solo se pueden deshabilitar usuarios con rol RECLUTADOR");
        }

        usuario.setActivo(false);
        Usuario actualizado = usuarioDao.save(usuario);
        return new UsuarioResponse(actualizado);
    }

    // =====================================================
    // HABILITAR RECLUTADOR
    // =====================================================
    @Transactional
    public UsuarioResponse habilitarReclutador(Long id) {

        Usuario usuario = usuarioDao.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id));

        if (usuario.getRol() != Usuario.Rol.RECLUTADOR) {
            throw new OperacionNoPermitidaException("Solo se pueden habilitar usuarios con rol RECLUTADOR");
        }

        usuario.setActivo(true);
        Usuario actualizado = usuarioDao.save(usuario);
        return new UsuarioResponse(actualizado);
    }

    // =====================================================
    // ELIMINAR RECLUTADOR (hard delete)
    // =====================================================
    @Transactional
    public void eliminarReclutador(Long id) {

        Usuario usuario = usuarioDao.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id));

        if (usuario.getRol() != Usuario.Rol.RECLUTADOR) {
            throw new OperacionNoPermitidaException("Solo se pueden eliminar usuarios con rol RECLUTADOR");
        }

        usuarioDao.deleteById(id);
    }
}