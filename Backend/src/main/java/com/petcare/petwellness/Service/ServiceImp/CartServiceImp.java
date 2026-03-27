package com.petcare.petwellness.Service.ServiceImp;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.petcare.petwellness.DTO.Request.CartItemAddRequestDto;
import com.petcare.petwellness.DTO.Request.CartItemUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.CartItemResponseDto;
import com.petcare.petwellness.DTO.Response.CartResponseDto;
import com.petcare.petwellness.Domain.Entity.Cart;
import com.petcare.petwellness.Domain.Entity.CartItem;
import com.petcare.petwellness.Domain.Entity.Product;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Enums.ProductStatus;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Repository.CartItemRepository;
import com.petcare.petwellness.Repository.CartRepository;
import com.petcare.petwellness.Repository.ProductRepository;
import com.petcare.petwellness.Repository.UserRepository;
import com.petcare.petwellness.Service.CartService;

@Service
public class CartServiceImp implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public CartServiceImp(CartRepository cartRepository,
                          CartItemRepository cartItemRepository,
                          ProductRepository productRepository,
                          UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponseDto getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            return new CartResponseDto();
        }
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponseDto addItem(Long userId, CartItemAddRequestDto request) {
        Integer quantity = request.getQuantity();
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        validateProductForCart(product);

        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        int nextQty = quantity;
        if (item != null) {
            nextQty = item.getQuantity() + quantity;
        }

        if (product.getStockQuantity() != null && nextQty > product.getStockQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock");
        }

        if (item == null) {
            item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
        }
        item.setQuantity(nextQty);
        cartItemRepository.save(item);

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponseDto updateItem(Long userId, Long itemId, CartItemUpdateRequestDto request) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        validateOwnership(userId, item.getCart());

        Integer quantity = request.getQuantity();
        if (quantity == null) {
            return mapToCartResponse(item.getCart());
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return mapToCartResponse(item.getCart());
        }

        Product product = item.getProduct();
        validateProductForCart(product);

        if (product.getStockQuantity() != null && quantity > product.getStockQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return mapToCartResponse(item.getCart());
    }

    @Override
    @Transactional
    public CartResponseDto removeItem(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        validateOwnership(userId, item.getCart());
        cartItemRepository.delete(item);
        return mapToCartResponse(item.getCart());
    }

    private Cart getOrCreateCart(Long userId) {
        Cart existing = cartRepository.findByUserId(userId).orElse(null);
        if (existing != null) {
            return existing;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    private void validateProductForCart(Product product) {
        if (product.getStatus() == ProductStatus.INACTIVE) {
            throw new BadRequestException("Product is not available");
        }
        if (product.getStockQuantity() == null || product.getStockQuantity() <= 0) {
            throw new BadRequestException("Product is out of stock");
        }
    }

    private void validateOwnership(Long userId, Cart cart) {
        Long ownerId = cart.getUser() != null ? cart.getUser().getId() : null;
        if (ownerId == null || !ownerId.equals(userId)) {
            throw new BadRequestException("You are not authorized to access this cart");
        }
    }

    private CartResponseDto mapToCartResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        List<CartItemResponseDto> itemDtos = items.stream()
                .map(this::mapToCartItem)
                .collect(Collectors.toList());

        BigDecimal total = itemDtos.stream()
                .map(CartItemResponseDto::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartResponseDto response = new CartResponseDto();
        response.setItems(itemDtos);
        response.setTotalAmount(total);
        return response;
    }

    private CartItemResponseDto mapToCartItem(CartItem item) {
        Product product = item.getProduct();
        BigDecimal price = product.getPrice();
        BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

        CartItemResponseDto dto = new CartItemResponseDto();
        dto.setId(item.getId());
        dto.setProductId(product.getId());
        dto.setProductName(product.getProductName());
        dto.setPrice(price);
        dto.setImage(toPublicFileUrl(product.getImage()));
        dto.setQuantity(item.getQuantity());
        dto.setLineTotal(lineTotal);
        dto.setStatus(product.getStatus());
        return dto;
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
