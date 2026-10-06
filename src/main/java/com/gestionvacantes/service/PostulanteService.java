package com.gestionvacantes.service;

import com.gestionvacantes.dao.UsuarioDao;
import com.gestionvacantes.dto.PostulanteRequest;
import com.gestionvacantes.dto.UsuarioResponse;
import com.gestionvacantes.entity.Usuario;
import com.gestionvacantes.exception.EmailYaExisteException;
import com.gestionvacantes.exception.OperacionNoPermitidaException;
import com.gestionvacantes.exception.RecursoNoEncontradoException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class PostulanteService {

    private final UsuarioDao usuarioDao;
    private final PasswordEncoder passwordEncoder;

    public PostulanteService(UsuarioDao usuarioDao, PasswordEncoder passwordEncoder) {
        this.usuarioDao = usuarioDao;
        this.passwordEncoder = passwordEncoder;
    }

    // =====================================================
    // REGISTRO PÚBLICO DE POSTULANTE
    // =====================================================
    @Transactional
    public UsuarioResponse registrar(PostulanteRequest request) {

        if (usuarioDao.existsByEmail(request.getEmail())) {
            throw new EmailYaExisteException("El email ya está registrado: " + request.getEmail());
        }

        Usuario usuario = new Usuario();
        usuario.setNombreCompleto(request.getNombreCompleto());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setTelefono(request.getTelefono());
        usuario.setDireccion(request.getDireccion());
        usuario.setRol(Usuario.Rol.POSTULANTE);
        usuario.setActivo(true);

        Usuario guardado = usuarioDao.save(usuario);
        return new UsuarioResponse(guardado);
    }

    // =====================================================
    // VER PERFIL PROPIO
    // =====================================================
    @Transactional(readOnly = true)
    public UsuarioResponse verPerfil(Long usuarioId) {

        Usuario usuario = usuarioDao.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + usuarioId));

        if (usuario.getRol() != Usuario.Rol.POSTULANTE) {
            throw new OperacionNoPermitidaException("El usuario no es un postulante");
        }

        return new UsuarioResponse(usuario);
    }

    // =====================================================
    // EDITAR PERFIL PROPIO
    // =====================================================
    @Transactional
    public UsuarioResponse editarPerfil(Long usuarioId, PostulanteRequest request) {

        Usuario usuario = usuarioDao.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + usuarioId));

        if (usuario.getRol() != Usuario.Rol.POSTULANTE) {
            throw new OperacionNoPermitidaException("El usuario no es un postulante");
        }

        if (!usuario.getEmail().equals(request.getEmail())
                && usuarioDao.existsByEmail(request.getEmail())) {
            throw new EmailYaExisteException("El email ya está registrado: " + request.getEmail());
        }

        usuario.setNombreCompleto(request.getNombreCompleto());
        usuario.setEmail(request.getEmail());
        usuario.setTelefono(request.getTelefono());
        usuario.setDireccion(request.getDireccion());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Usuario actualizado = usuarioDao.save(usuario);
        return new UsuarioResponse(actualizado);
    }

    // =====================================================
    // SUBIR HOJA DE VIDA
    // =====================================================
    @Transactional
    public UsuarioResponse subirHojaDeVida(Long usuarioId, MultipartFile archivo) {

        Usuario usuario = usuarioDao.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + usuarioId));

        if (usuario.getRol() != Usuario.Rol.POSTULANTE) {
            throw new OperacionNoPermitidaException("El usuario no es un postulante");
        }

        if (archivo == null || archivo.isEmpty()) {
            throw new OperacionNoPermitidaException("Debe seleccionar un archivo");
        }

        String contentType = archivo.getContentType();
        String nombreArchivo = archivo.getOriginalFilename();
        if (contentType == null || !contentType.equals("application/pdf")
                || nombreArchivo == null || !nombreArchivo.toLowerCase().endsWith(".pdf")) {
            throw new OperacionNoPermitidaException("La hoja de vida debe ser un archivo PDF");
        }

        if (archivo.getSize() > 5 * 1024 * 1024) {
            throw new OperacionNoPermitidaException("La hoja de vida no puede superar 5 MB");
        }

        try {
            usuario.setHojaVida(archivo.getBytes());
            usuario.setHojaVidaNombre(nombreArchivo);
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo PDF", e);
        }

        Usuario actualizado = usuarioDao.save(usuario);
        return new UsuarioResponse(actualizado);
    }

    // =====================================================
    // DESCARGAR HOJA DE VIDA
    // =====================================================
    @Transactional(readOnly = true)
    public byte[] descargarHojaDeVida(Long usuarioId) {

        Usuario usuario = usuarioDao.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + usuarioId));

        if (usuario.getHojaVida() == null || usuario.getHojaVida().length == 0) {
            throw new RecursoNoEncontradoException("El usuario no tiene hoja de vida cargada");
        }

        return usuario.getHojaVida();
    }

    // =====================================================
    // OBTENER NOMBRE DE HOJA DE VIDA
    // =====================================================
    @Transactional(readOnly = true)
    public String obtenerNombreHojaDeVida(Long usuarioId) {
        Usuario usuario = usuarioDao.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + usuarioId));
        return usuario.getHojaVidaNombre() != null ? usuario.getHojaVidaNombre() : "hoja_vida.pdf";
    }

    // =====================================================
    // VER PERFIL POR EMAIL (helper para el controller)
    // =====================================================
    @Transactional(readOnly = true)
    public UsuarioResponse verPerfilPorEmail(String email) {
        Usuario usuario = usuarioDao.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con email: " + email));
        return new UsuarioResponse(usuario);
    }
}