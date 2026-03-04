package com.petcare.app.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double price;
    private String category;    // Food, Medicine, Accessories, Grooming
    private String imageUrl;
    private Integer stock;
}
