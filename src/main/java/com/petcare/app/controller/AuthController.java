package com.petcare.app.controller;

import com.petcare.app.model.User;
import com.petcare.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // Mandatory to prevent CORS/Network errors
public class AuthController {

    @Autowired
    private UserService userService;

    // --- NEW: Fetch all Doctors for the Appointment Module ---
    @GetMapping("/doctors")
    public List<User> getAllDoctors() {
        // Now correctly calls the updated service method
        return userService.getAllUsers().stream()
                .filter(user -> "DOCTOR".equalsIgnoreCase(user.getRole()))
                .collect(Collectors.toList());
    }

    @GetMapping("/profile")
    public User getProfile(@RequestParam String email) {
        return userService.getUserByEmail(email);
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        boolean exists = userService.emailExists(email);
        return ResponseEntity.ok(exists);
    }

    @DeleteMapping("/delete")
    public String deleteAccount(@RequestParam String email) {
        User user = userService.getUserByEmail(email);
        if (user != null) {
            userService.deleteUser(user.getId());
            return "Deleted";
        }
        return "User not found";
    }

    @PutMapping("/change-password")
    public String changePassword(@RequestParam String email, @RequestParam String newPassword) {
        User user = userService.getUserByEmail(email);
        if (user != null) {
            user.setPassword(newPassword);
            userService.registerUser(user);
            return "Password Updated";
        }
        return "User not found";
    }

    @PostMapping("/signup")
    public User signUp(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User found = userService.login(user.getEmail(), user.getPassword());
        if (found != null) {
            return ResponseEntity.ok(new LoginResponse("Login Successful", found.getRole()));
        }
        return ResponseEntity.status(401).body("Invalid Credentials");
    }

    class LoginResponse {
        public String message;
        public String role;
        public LoginResponse(String m, String r) { this.message = m; this.role = r; }
    }
    @PutMapping("/availability")
    public ResponseEntity<?> updateAvailability(@RequestParam String email, @RequestParam boolean status) {
        User user = userService.getUserByEmail(email);
        if (user != null) {
            // Convert boolean from frontend to 0/1 for the database
            user.setAvailable(status ? 1 : 0);
            userService.registerUser(user);
            return ResponseEntity.ok("Status Updated Successfully");
        }
        return ResponseEntity.status(404).body("User not found");
    }
}