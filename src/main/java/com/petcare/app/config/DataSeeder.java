package com.petcare.app.config;

import com.petcare.app.model.Product;
import com.petcare.app.model.User;
import com.petcare.app.repository.ProductRepository;
import com.petcare.app.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private UserRepository userRepo;

    @Override
    public void run(String... args) {
        // Seed Users if empty
        if (userRepo.count() == 0) {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            User doc = new User();
            doc.setFullName("Dr. Smith");
            doc.setEmail("doc@vet.com");
            doc.setPassword(encoder.encode("password"));
            doc.setRole("DOCTOR");
            doc.setAvailable(1);
            userRepo.save(doc);

            User owner = new User();
            owner.setFullName("Test Owner");
            owner.setEmail("test@user.com");
            owner.setPassword(encoder.encode("password"));
            owner.setRole("PET_OWNER");
            owner.setAvailable(0);
            userRepo.save(owner);
            System.out.println("✅ Sample users (doc@vet.com, test@user.com) seeded successfully!");
        }

        // Only seed if the products table is empty
        if (productRepo.count() > 0)
            return;

        seed("Premium Dog Food", "High-quality kibble with real chicken and vegetables", 29.99, "Food",
                "https://images.unsplash.com/photo-1589924749359-e377686e19c0?w=300", 50);
        seed("Cat Wet Food Variety Pack", "12-pack assorted flavors for cats", 18.99, "Food",
                "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300", 40);
        seed("Organic Puppy Treats", "Natural grain-free training treats", 12.49, "Food",
                "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=300", 75);

        seed("Flea & Tick Prevention", "Monthly topical treatment for dogs", 34.99, "Medicine",
                "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=300", 30);
        seed("Pet Multivitamins", "Daily supplement for dogs and cats", 19.99, "Medicine",
                "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300", 60);
        seed("Joint Health Supplement", "Glucosamine chondroitin for senior pets", 24.99, "Medicine",
                "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=300", 45);

        seed("Adjustable Pet Collar", "Durable nylon collar with reflective strip", 9.99, "Accessories",
                "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=300", 100);
        seed("Interactive Dog Toy", "Squeaky chew toy for medium breeds", 14.99, "Accessories",
                "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=300", 80);
        seed("Cat Scratching Post", "Sisal rope tower with platform", 39.99, "Accessories",
                "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=300", 25);
        seed("Pet Travel Carrier", "Airline-approved soft-sided carrier", 44.99, "Accessories",
                "https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=300", 20);

        seed("Pet Shampoo - Oatmeal", "Gentle hypoallergenic formula", 11.99, "Grooming",
                "https://images.unsplash.com/photo-1583337130417-13104dec14a6?w=300", 55);
        seed("Grooming Brush Set", "Double-sided pin and bristle brush", 16.99, "Grooming",
                "https://images.unsplash.com/photo-1581888227599-779811939961?w=300", 40);
        seed("Nail Clipper for Pets", "Professional-grade with safety guard", 8.99, "Grooming",
                "https://images.unsplash.com/photo-1591856419156-4e118a4b5b2a?w=300", 65);

        System.out.println("✅ Sample products seeded successfully!");
    }

    private void seed(String name, String desc, double price, String category, String imageUrl, int stock) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setPrice(price);
        p.setCategory(category);
        p.setImageUrl(imageUrl);
        p.setStock(stock);
        productRepo.save(p);
    }
}
