package com.petcare.petwellness.DTO.Request;

import java.math.BigDecimal;

import com.petcare.petwellness.Enums.ProductCategory;
import com.petcare.petwellness.Enums.ProductStatus;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class ProductUpdateRequestDto {

    @Size(max = 150)
    private String productName;

    @Size(max = 2000)
    private String description;

    @Positive
    private BigDecimal price;

    private ProductCategory category;

    @Size(max = 100)
    private String brand;

    @PositiveOrZero
    private Integer stockQuantity;

    private ProductStatus status;

    private MultipartFile image;

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public ProductCategory getCategory() {
        return category;
    }

    public void setCategory(ProductCategory category) {
        this.category = category;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public ProductStatus getStatus() {
        return status;
    }

    public void setStatus(ProductStatus status) {
        this.status = status;
    }

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }
}
