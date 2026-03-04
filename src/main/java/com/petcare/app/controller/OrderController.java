package com.petcare.app.controller;

import com.petcare.app.model.Order;
import com.petcare.app.model.OrderItem;
import com.petcare.app.model.Product;
import com.petcare.app.model.User;
import com.petcare.app.repository.OrderRepository;
import com.petcare.app.repository.ProductRepository;
import com.petcare.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private UserRepository userRepo;

    // Place a new order
    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String address = (String) payload.get("shippingAddress");
        List<Map<String, Object>> cartItems = (List<Map<String, Object>>) payload.get("items");

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(address);

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;

        for (Map<String, Object> item : cartItems) {
            Long productId = Long.parseLong(item.get("productId").toString());
            int qty = Integer.parseInt(item.get("quantity").toString());

            Product product = productRepo.findById(productId).orElseThrow();

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(qty);
            orderItem.setPrice(product.getPrice() * qty);
            orderItems.add(orderItem);

            total += product.getPrice() * qty;

            // Reduce stock
            product.setStock(product.getStock() - qty);
            productRepo.save(product);
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);
        orderRepo.save(order);

        return ResponseEntity.ok(Map.of("message", "Order placed successfully!", "orderId", order.getId()));
    }

    // Get order history for a user
    @GetMapping("/history")
    public List<Order> getOrderHistory(@RequestParam("email") String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepo.findByUserIdOrderByOrderDateDesc(user.getId());
    }

    // Get single order details
    @GetMapping("/{id}")
    public Order getOrder(@PathVariable("id") Long id) {
        return orderRepo.findById(id).orElseThrow();
    }

    // Update order status (for admin/simulation)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
        Order order = orderRepo.findById(id).orElseThrow();
        order.setStatus(status);
        orderRepo.save(order);
        return ResponseEntity.ok("Order status updated to " + status);
    }
}
