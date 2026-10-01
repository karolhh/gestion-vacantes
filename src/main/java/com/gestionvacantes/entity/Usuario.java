package com.gestionvacantes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Arrays;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe tener un formato válido")
    @Size(max = 150, message = "El email no puede superar 150 caracteres")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 255, message = "La contraseña debe tener entre 8 y 255 caracteres")
    @Column(nullable = false, length = 255)
    private String password;

    @Size(max = 20, message = "El teléfono no puede superar 20 caracteres")
    @Column(length = 20)
    private String telefono;

    @Size(max = 255, message = "La dirección no puede superar 255 caracteres")
    @Column(length = 255)
    private String direccion;

    @Size(max = 100, message = "El departamento no puede superar 100 caracteres")
    @Column(length = 100)
    private String departamento;

    @Lob
    @Column(name = "hoja_vida", columnDefinition = "LONGBLOB")
    private byte[] hojaVida;

    @Size(max = 255, message = "El nombre del archivo no puede superar 255 caracteres")
    @Column(name = "hoja_vida_nombre", length = 255)
    private String hojaVidaNombre;

    @NotNull(message = "El rol es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void onCreate() {
        this.fechaRegistro = LocalDateTime.now();
        if (this.activo == null) {
            this.activo = true;
        }
    }

    public enum Rol {
        ADMIN, RECLUTADOR, POSTULANTE
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", nombreCompleto='" + nombreCompleto + '\'' +
                ", email='" + email + '\'' +
                ", rol=" + rol +
                ", activo=" + activo +
                ", fechaRegistro=" + fechaRegistro +
                '}';
    }
}