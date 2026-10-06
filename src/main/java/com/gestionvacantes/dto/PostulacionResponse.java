package com.gestionvacantes.dto;

import com.gestionvacantes.entity.Postulacion;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostulacionResponse {

    private Long id;
    private Long vacanteId;
    private String vacanteTitulo;
    private Long postulanteId;
    private String postulanteNombre;
    private String postulanteEmail;
    private Postulacion.Estado estado;
    private LocalDateTime fechaPostulacion;
    private LocalDateTime fechaActualizacion;

    public PostulacionResponse(Postulacion postulacion) {
        this.id = postulacion.getId();
        this.estado = postulacion.getEstado();
        this.fechaPostulacion = postulacion.getFechaPostulacion();
        this.fechaActualizacion = postulacion.getFechaActualizacion();

        if (postulacion.getVacante() != null) {
            this.vacanteId = postulacion.getVacante().getId();
            this.vacanteTitulo = postulacion.getVacante().getTitulo();
        }

        if (postulacion.getPostulante() != null) {
            this.postulanteId = postulacion.getPostulante().getId();
            this.postulanteNombre = postulacion.getPostulante().getNombreCompleto();
            this.postulanteEmail = postulacion.getPostulante().getEmail();
        }
    }
}