package com.petcare.petwellness.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.petcare.petwellness.DTO.Request.ProductCreateRequestDto;
import com.petcare.petwellness.DTO.Request.ProductUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.ProductResponseDto;
import com.petcare.petwellness.Enums.ProductCategory;
import com.petcare.petwellness.Service.ProductService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/products")
@SecurityRequirement(name = "bearerAuth")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping(value = "/add", consumes = "multipart/form-data")
    public ResponseEntity<ProductResponseDto> createProduct(
            @Valid @ModelAttribute ProductCreateRequestDto request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PatchMapping(value = "/update/{productId}", consumes = "multipart/form-data")
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable Long productId,
            @Valid @ModelAttribute ProductUpdateRequestDto request) {
        return ResponseEntity.ok(productService.updateProduct(productId, request));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponseDto> getProductById(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.getProductById(productId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProductResponseDto>> getProducts(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) ProductCategory category) {
        return ResponseEntity.ok(productService.getProducts(offset, limit, category));
    }

    @DeleteMapping("/delete/{productId}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.deleteProduct(productId));
    }

}
