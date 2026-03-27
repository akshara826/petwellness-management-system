package com.petcare.petwellness.Service;

import java.util.List;

import com.petcare.petwellness.DTO.Request.ProductCreateRequestDto;
import com.petcare.petwellness.DTO.Request.ProductUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.ProductResponseDto;
import com.petcare.petwellness.Enums.ProductCategory;

public interface ProductService {

    ProductResponseDto createProduct(ProductCreateRequestDto request);

    ProductResponseDto updateProduct(Long productId, ProductUpdateRequestDto request);

    ProductResponseDto getProductById(Long productId);

    List<ProductResponseDto> getProducts(int offset, int limit, ProductCategory category);

    List<ProductResponseDto> getPublicProducts(int offset, int limit, ProductCategory category);

    String deleteProduct(Long productId);
}
