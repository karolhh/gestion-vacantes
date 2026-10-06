package com.gestionvacantes.repository;

import com.gestionvacantes.entity.Postulacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostulacionRepository extends JpaRepository<Postulacion, Long> {

    List<Postulacion> findByPostulanteId(Long postulanteId);

    List<Postulacion> findByVacanteId(Long vacanteId);

    List<Postulacion> findByVacanteIdAndEstado(Long vacanteId, Postulacion.Estado estado);

    List<Postulacion> findByPostulanteIdAndEstado(Long postulanteId, Postulacion.Estado estado);

    Optional<Postulacion> findByVacanteIdAndPostulanteId(Long vacanteId, Long postulanteId);

    boolean existsByVacanteIdAndPostulanteId(Long vacanteId, Long postulanteId);
}