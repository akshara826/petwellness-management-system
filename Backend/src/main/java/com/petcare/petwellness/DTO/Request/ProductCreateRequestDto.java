package com.petcare.petwellness.DTO.Request;

import java.math.BigDecimal;

import com.petcare.petwellness.Enums.ProductCategory;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class ProductCreateRequestDto {
 
    @Size(max = 50)
    @NotBlank
    private String productName;

    @Size(max=500)
    @NotBlank                       
    private String description;

    @NotNull
    @Positive
    private BigDecimal price;

    @NotNull
    private ProductCategory category;

    @NotNull
    @Positive
    private Integer stockQuantity;

    
    @NotNull(message = "Product image is required")
    private MultipartFile image;

    private String brand;


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

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }


}
