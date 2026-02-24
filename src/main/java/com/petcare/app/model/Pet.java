package com.petcare.app.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "pets")
@Data
public class Pet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String species; // e.g., Dog, Cat
    private String breed;
    private Integer age;
    private Double weight;

    @ManyToOne
    @JoinColumn(name = "owner_id", referencedColumnName = "id")
    private User owner; // Links the pet to the User (Pet Owner)
}