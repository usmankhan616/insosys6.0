package com.petcare.app.controller;

import com.petcare.app.model.Product;
import com.petcare.app.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductRepository productRepo;

    // Get all products
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    // Get products by category
    @GetMapping("/category/{category}")
    public List<Product> getByCategory(@PathVariable("category") String category) {
        return productRepo.findByCategory(category);
    }

    // Search products by name
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam("keyword") String keyword) {
        return productRepo.findByNameContainingIgnoreCase(keyword);
    }

    // Get a single product
    @GetMapping("/{id}")
    public Product getProduct(@PathVariable("id") Long id) {
        return productRepo.findById(id).orElseThrow();
    }
}
