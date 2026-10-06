package com.gestionvacantes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "postulacion",
       uniqueConstraints = @UniqueConstraint(
               name = "uq_postulacion_unica",
               columnNames = {"vacante_id", "postulante_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Postulacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La vacante es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacante_id", nullable = false)
    private Vacante vacante;

    @NotNull(message = "El postulante es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "postulante_id", nullable = false)
    private Usuario postulante;

    @NotNull(message = "El estado es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Estado estado = Estado.RECIBIDA;

    @Column(name = "fecha_postulacion", nullable = false, updatable = false)
    private LocalDateTime fechaPostulacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        this.fechaPostulacion = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = Estado.RECIBIDA;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    public enum Estado {
        RECIBIDA, REVISADA, PRESELECCIONADA, CONTRATADA, RECHAZADA
    }

    @Override
    public String toString() {
        return "Postulacion{" +
                "id=" + id +
                ", vacanteId=" + (vacante != null ? vacante.getId() : null) +
                ", postulanteId=" + (postulante != null ? postulante.getId() : null) +
                ", estado=" + estado +
                ", fechaPostulacion=" + fechaPostulacion +
                '}';
    }
}