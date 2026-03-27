package com.petcare.petwellness.Service.ServiceImp;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.petcare.petwellness.DTO.Request.ProductCreateRequestDto;
import com.petcare.petwellness.DTO.Request.ProductUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.ProductResponseDto;
import com.petcare.petwellness.Domain.Entity.Product;
import com.petcare.petwellness.Enums.ProductCategory;
import com.petcare.petwellness.Enums.ProductStatus;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Repository.ProductRepository;
import com.petcare.petwellness.Service.ProductService;
import com.petcare.petwellness.Util.FileStorageUtil;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductServiceImp implements ProductService {

    private static final long MAX_PRODUCT_IMAGE_BYTES = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private final ProductRepository productRepository;
    private final FileStorageUtil fileStorageUtil;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ProductServiceImp(ProductRepository productRepository, FileStorageUtil fileStorageUtil) {
        this.productRepository = productRepository;
        this.fileStorageUtil = fileStorageUtil;
    }

    @Override
    @Transactional
    public ProductResponseDto createProduct(ProductCreateRequestDto request) {
        Integer stockQuantity = request.getStockQuantity();
        if (stockQuantity == null || stockQuantity <= 0) {
            throw new BadRequestException("Stock quantity must be greater than 0");
        }

        Product product = new Product();
        product.setProductName(trimToNull(request.getProductName()));
        product.setDescription(trimToNull(request.getDescription()));
        product.setPrice(request.getPrice());
        product.setCategory(request.getCategory());
        product.setBrand(trimToNull(request.getBrand()));
        product.setStockQuantity(stockQuantity);

        if (request.getImage() == null || request.getImage().isEmpty()) {
            throw new BadRequestException("Product image is required");
        }
        validateProductImage(request.getImage());
        product.setImage(saveImage(request.getImage()));

        if (stockQuantity == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else {
            product.setStatus(ProductStatus.ACTIVE);
        }

        Product saved = productRepository.save(product);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ProductResponseDto updateProduct(Long productId, ProductUpdateRequestDto request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        String productName = trimToNull(request.getProductName());
        if (productName != null) {
            product.setProductName(productName);
        }

        String description = trimToNull(request.getDescription());
        if (description != null) {
            product.setDescription(description);
        }

        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }

        if (request.getCategory() != null) {
            product.setCategory(request.getCategory());
        }

        String brand = trimToNull(request.getBrand());
        if (brand != null) {
            product.setBrand(brand);
        }

        if (request.getStockQuantity() != null) {
            if (request.getStockQuantity() < 0) {
                throw new BadRequestException("Stock quantity cannot be negative");
            }
            product.setStockQuantity(request.getStockQuantity());
        }

        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        MultipartFile image = request.getImage();
        if (image != null && !image.isEmpty()) {
            validateProductImage(image);
            String oldImagePath = product.getImage();
            product.setImage(saveImage(image));
            fileStorageUtil.deleteFileQuietly(oldImagePath);
        }

        syncStatusWithStock(product);

        Product saved = productRepository.save(product);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return mapToDto(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getProducts(int offset, int limit, ProductCategory category) {
        validatePagination(offset, limit);

        PageRequest pageable = PageRequest.of(
                offset,
                limit,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return (category == null
                ? productRepository.findAll(pageable)
                : productRepository.findByCategory(category, pageable))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getPublicProducts(int offset, int limit, ProductCategory category) {
        validatePagination(offset, limit);

        PageRequest pageable = PageRequest.of(
                offset,
                limit,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        List<ProductStatus> visibleStatuses = List.of(ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK);
        return (category == null
                ? productRepository.findByStatusIn(visibleStatuses, pageable)
                : productRepository.findByStatusInAndCategory(visibleStatuses, category, pageable))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        fileStorageUtil.deleteFileQuietly(product.getImage());
        productRepository.delete(product);
        return "Product deleted successfully";
    }

    private ProductResponseDto mapToDto(Product product) {
        ProductResponseDto dto = new ProductResponseDto();
        dto.setId(product.getId());
        dto.setProductName(product.getProductName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCategory(product.getCategory());
        dto.setBrand(product.getBrand());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setStatus(product.getStatus());
        dto.setImage(toPublicFileUrl(product.getImage()));
        dto.setCreatedAt(product.getCreatedAt());
        return dto;
    }

    private void validatePagination(int offset, int limit) {
        if (offset < 0) {
            throw new BadRequestException("Offset must be >= 0");
        }
        if (limit <= 0) {
            throw new BadRequestException("Limit must be > 0");
        }
    }

    private void syncStatusWithStock(Product product) {
        Integer stock = product.getStockQuantity();
        if (stock == null) {
            return;
        }

        if (stock == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            product.setStatus(ProductStatus.ACTIVE);
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String saveImage(MultipartFile file) {
        try {
            return fileStorageUtil.saveFile(file, "product-images");
        } catch (RuntimeException ex) {
            throw new BadRequestException("Product image upload failed: " + ex.getMessage());
        }
    }

    private void validateProductImage(MultipartFile image) {
        String contentType = image.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid product image type. Allowed: jpg, jpeg, png, webp");
        }

        if (image.getSize() > MAX_PRODUCT_IMAGE_BYTES) {
            throw new BadRequestException("Product image size must be <= 10MB");
        }
    }

    private String toPublicFileUrl(String absolutePath) {
        if (absolutePath == null || absolutePath.isBlank()) {
            return null;
        }

        try {
            Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = Paths.get(absolutePath).toAbsolutePath().normalize();
            Path relative = basePath.relativize(filePath);
            return "/uploads/" + relative.toString().replace("\\", "/");
        } catch (RuntimeException ex) {
            return null;
        }
    }
}
