package com.gestionvacantes.dao.impl;

import com.gestionvacantes.dao.PostulacionDao;
import com.gestionvacantes.entity.Postulacion;
import com.gestionvacantes.repository.PostulacionRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class PostulacionDaoImpl implements PostulacionDao {

    private final PostulacionRepository postulacionRepository;

    public PostulacionDaoImpl(PostulacionRepository postulacionRepository) {
        this.postulacionRepository = postulacionRepository;
    }

    @Override
    public Postulacion save(Postulacion postulacion) {
        return postulacionRepository.save(postulacion);
    }

    @Override
    public Optional<Postulacion> findById(Long id) {
        return postulacionRepository.findById(id);
    }

    @Override
    public List<Postulacion> findAll() {
        return postulacionRepository.findAll();
    }

    @Override
    public List<Postulacion> findByPostulanteId(Long postulanteId) {
        return postulacionRepository.findByPostulanteId(postulanteId);
    }

    @Override
    public List<Postulacion> findByVacanteId(Long vacanteId) {
        return postulacionRepository.findByVacanteId(vacanteId);
    }

    @Override
    public List<Postulacion> findByVacanteIdAndEstado(Long vacanteId, Postulacion.Estado estado) {
        return postulacionRepository.findByVacanteIdAndEstado(vacanteId, estado);
    }

    @Override
    public List<Postulacion> findByPostulanteIdAndEstado(Long postulanteId, Postulacion.Estado estado) {
        return postulacionRepository.findByPostulanteIdAndEstado(postulanteId, estado);
    }

    @Override
    public Optional<Postulacion> findByVacanteIdAndPostulanteId(Long vacanteId, Long postulanteId) {
        return postulacionRepository.findByVacanteIdAndPostulanteId(vacanteId, postulanteId);
    }

    @Override
    public boolean existsByVacanteIdAndPostulanteId(Long vacanteId, Long postulanteId) {
        return postulacionRepository.existsByVacanteIdAndPostulanteId(vacanteId, postulanteId);
    }

    @Override
    public void deleteById(Long id) {
        postulacionRepository.deleteById(id);
    }
}