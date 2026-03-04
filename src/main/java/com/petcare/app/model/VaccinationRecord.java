package com.petcare.app.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "vaccination_records")
@Data
public class VaccinationRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vaccineName;       // e.g., Rabies, Distemper, Bordetella
    private String vaccineType;       // Core, Noncore, Overdue
    private LocalDate dateAdministered;
    private LocalDate nextDueDate;
    private String veterinarianName;
    private Boolean isCompleted = false;  // Track if vaccination is marked as done

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pet_id")
    private Pet pet;
}
