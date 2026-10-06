package com.gestionvacantes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vacante")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Vacante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 200, message = "El título no puede superar 200 caracteres")
    @Column(nullable = false, length = 200)
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(columnDefinition = "TEXT")
    private String requisitos;

    @DecimalMin(value = "0.0", inclusive = false, message = "El salario debe ser mayor a 0")
    @Digits(integer = 10, fraction = 2, message = "El salario debe tener máximo 10 dígitos enteros y 2 decimales")
    @Column(precision = 12, scale = 2)
    private BigDecimal salario;

    @NotBlank(message = "La ubicación es obligatoria")
    @Size(max = 150, message = "La ubicación no puede superar 150 caracteres")
    @Column(nullable = false, length = 150)
    private String ubicacion;

    @NotNull(message = "El estado es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Estado estado = Estado.ABIERTA;

    @NotNull(message = "El reclutador es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reclutador_id", nullable = false)
    private Usuario reclutador;

    @Column(name = "fecha_publicacion", nullable = false, updatable = false)
    private LocalDateTime fechaPublicacion;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @PrePersist
    protected void onCreate() {
        this.fechaPublicacion = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = Estado.ABIERTA;
        }
    }

    public enum Estado {
        ABIERTA, EN_PROCESO, CERRADA
    }

    @Override
    public String toString() {
        return "Vacante{" +
                "id=" + id +
                ", titulo='" + titulo + '\'' +
                ", ubicacion='" + ubicacion + '\'' +
                ", estado=" + estado +
                ", fechaPublicacion=" + fechaPublicacion +
                '}';
    }
}