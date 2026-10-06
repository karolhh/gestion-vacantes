package com.gestionvacantes.service;

import com.gestionvacantes.dao.PostulacionDao;
import com.gestionvacantes.dao.UsuarioDao;
import com.gestionvacantes.dao.VacanteDao;
import com.gestionvacantes.dto.PostulacionRequest;
import com.gestionvacantes.dto.PostulacionResponse;
import com.gestionvacantes.entity.Postulacion;
import com.gestionvacantes.entity.Usuario;
import com.gestionvacantes.entity.Vacante;
import com.gestionvacantes.exception.EmailYaExisteException;
import com.gestionvacantes.exception.OperacionNoPermitidaException;
import com.gestionvacantes.exception.RecursoNoEncontradoException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostulacionService {

    private final PostulacionDao postulacionDao;
    private final VacanteDao vacanteDao;
    private final UsuarioDao usuarioDao;

    public PostulacionService(PostulacionDao postulacionDao,
                              VacanteDao vacanteDao,
                              UsuarioDao usuarioDao) {
        this.postulacionDao = postulacionDao;
        this.vacanteDao = vacanteDao;
        this.usuarioDao = usuarioDao;
    }

    // =====================================================
    // POSTULARSE A UNA VACANTE
    // =====================================================
    @Transactional
    public PostulacionResponse postularse(PostulacionRequest request) {

        // 1. Verificar que la vacante existe
        Vacante vacante = vacanteDao.findById(request.getVacanteId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Vacante no encontrada con id: " + request.getVacanteId()));

        // 2. Verificar que la vacante esté ABIERTA
        if (vacante.getEstado() != Vacante.Estado.ABIERTA) {
            throw new OperacionNoPermitidaException("La vacante no está abierta para postulaciones");
        }

        // 3. Verificar que el postulante existe y es POSTULANTE
        Usuario postulante = usuarioDao.findById(request.getPostulanteId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Postulante no encontrado con id: " + request.getPostulanteId()));

        if (postulante.getRol() != Usuario.Rol.POSTULANTE) {
            throw new OperacionNoPermitidaException("El usuario indicado no tiene rol POSTULANTE");
        }

        if (!Boolean.TRUE.equals(postulante.getActivo())) {
            throw new OperacionNoPermitidaException("El postulante está deshabilitado");
        }

        // 4. Verificar que el postulante tenga hoja de vida cargada
        if (postulante.getHojaVida() == null || postulante.getHojaVida().length == 0) {
            throw new OperacionNoPermitidaException(
                    "Debe cargar su hoja de vida antes de postularse a una vacante");
        }

        // 5. Verificar que no se haya postulado antes a la misma vacante
        if (postulacionDao.existsByVacanteIdAndPostulanteId(vacante.getId(), postulante.getId())) {
            throw new OperacionNoPermitidaException(
                    "Ya se ha postulado a esta vacante anteriormente");
        }

        // 6. Crear la postulación
        Postulacion postulacion = new Postulacion();
        postulacion.setVacante(vacante);
        postulacion.setPostulante(postulante);
        postulacion.setEstado(Postulacion.Estado.RECIBIDA);

        Postulacion guardada = postulacionDao.save(postulacion);
        return new PostulacionResponse(guardada);
    }

    // =====================================================
    // VER MIS POSTULACIONES (postulante)
    // =====================================================
    @Transactional(readOnly = true)
    public List<PostulacionResponse> listarMisPostulaciones(Long postulanteId) {
        return postulacionDao.findByPostulanteId(postulanteId).stream()
                .map(PostulacionResponse::new)
                .toList();
    }

    // =====================================================
    // VER MIS POSTULACIONES POR ESTADO
    // =====================================================
    @Transactional(readOnly = true)
    public List<PostulacionResponse> listarMisPostulacionesPorEstado(Long postulanteId, Postulacion.Estado estado) {
        return postulacionDao.findByPostulanteIdAndEstado(postulanteId, estado).stream()
                .map(PostulacionResponse::new)
                .toList();
    }

    // =====================================================
    // BUSCAR POSTULACIÓN POR ID
    // =====================================================
    @Transactional(readOnly = true)
    public PostulacionResponse buscarPorId(Long id) {
        Postulacion postulacion = postulacionDao.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Postulación no encontrada con id: " + id));
        return new PostulacionResponse(postulacion);
    }

    // =====================================================
    // VER POSTULACIONES DE UNA VACANTE (reclutador)
    // =====================================================
    @Transactional(readOnly = true)
    public List<PostulacionResponse> listarPorVacante(Long vacanteId) {
        return postulacionDao.findByVacanteId(vacanteId).stream()
                .map(PostulacionResponse::new)
                .toList();
    }

    // =====================================================
    // VER POSTULACIONES DE UNA VACANTE POR ESTADO (reclutador)
    // =====================================================
    @Transactional(readOnly = true)
    public List<PostulacionResponse> listarPorVacanteYEstado(Long vacanteId, Postulacion.Estado estado) {
        return postulacionDao.findByVacanteIdAndEstado(vacanteId, estado).stream()
                .map(PostulacionResponse::new)
                .toList();
    }

    // =====================================================
    // ACTUALIZAR ESTADO (reclutador)
    // =====================================================
    @Transactional
    public PostulacionResponse actualizarEstado(Long id, Postulacion.Estado nuevoEstado) {

        Postulacion postulacion = postulacionDao.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Postulación no encontrada con id: " + id));

        if (postulacion.getEstado() == Postulacion.Estado.CONTRATADA) {
            throw new OperacionNoPermitidaException("No se puede modificar una postulación ya CONTRATADA");
        }

        if (postulacion.getEstado() == Postulacion.Estado.RECHAZADA) {
            throw new OperacionNoPermitidaException("No se puede modificar una postulación ya RECHAZADA");
        }

        postulacion.setEstado(nuevoEstado);
        Postulacion actualizada = postulacionDao.save(postulacion);
        return new PostulacionResponse(actualizada);
    }

    // =====================================================
    // ELIMINAR POSTULACIÓN (admin)
    // =====================================================
    @Transactional
    public void eliminar(Long id) {
        Postulacion postulacion = postulacionDao.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Postulación no encontrada con id: " + id));
        postulacionDao.deleteById(id);
    }
}