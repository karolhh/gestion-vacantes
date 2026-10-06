package com.gestionvacantes.dao;

import com.gestionvacantes.entity.Postulacion;

import java.util.List;
import java.util.Optional;

public interface PostulacionDao {

    Postulacion save(Postulacion postulacion);

    Optional<Postulacion> findById(Long id);

    List<Postulacion> findAll();

    List<Postulacion> findByPostulanteId(Long postulanteId);

    List<Postulacion> findByVacanteId(Long vacanteId);

    List<Postulacion> findByVacanteIdAndEstado(Long vacanteId, Postulacion.Estado estado);

    List<Postulacion> findByPostulanteIdAndEstado(Long postulanteId, Postulacion.Estado estado);

    Optional<Postulacion> findByVacanteIdAndPostulanteId(Long vacanteId, Long postulanteId);

    boolean existsByVacanteIdAndPostulanteId(Long vacanteId, Long postulanteId);

    void deleteById(Long id);
}