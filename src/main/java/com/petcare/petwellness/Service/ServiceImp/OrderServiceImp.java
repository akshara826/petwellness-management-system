package com.petcare.petwellness.Service.ServiceImp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.context.ApplicationEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.petcare.petwellness.DTO.Request.AdminOrderCancelRequestDto;
import com.petcare.petwellness.DTO.Request.CheckoutRequestDto;
import com.petcare.petwellness.DTO.Request.OrderCancelRequestDto;
import com.petcare.petwellness.DTO.Request.OrderStatusUpdateRequestDto;
import com.petcare.petwellness.DTO.Request.RazorpayPaymentVerifyRequestDto;
import com.petcare.petwellness.DTO.Response.OrderItemResponseDto;
import com.petcare.petwellness.DTO.Response.OrderResponseDto;
import com.petcare.petwellness.DTO.Response.RazorpayOrderResponseDto;
import com.petcare.petwellness.Domain.Entity.Cart;
import com.petcare.petwellness.Domain.Entity.CartItem;
import com.petcare.petwellness.Domain.Entity.Order;
import com.petcare.petwellness.Domain.Entity.OrderItem;
import com.petcare.petwellness.Domain.Entity.Product;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Events.OrderStatusChangeSource;
import com.petcare.petwellness.Events.OrderStatusChangedEvent;
import com.petcare.petwellness.Enums.OrderStatus;
import com.petcare.petwellness.Enums.ProductStatus;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Repository.CartItemRepository;
import com.petcare.petwellness.Repository.CartRepository;
import com.petcare.petwellness.Repository.OrderItemRepository;
import com.petcare.petwellness.Repository.OrderRepository;
import com.petcare.petwellness.Repository.ProductRepository;
import com.petcare.petwellness.Repository.UserRepository;
import com.petcare.petwellness.Service.OrderService;
import com.petcare.petwellness.Service.RazorpayService;

@Service
public class OrderServiceImp implements OrderService {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrderServiceImp.class);

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final RazorpayService razorpayService;
    private final TransactionTemplate transactionTemplate;
    private final ApplicationEventPublisher eventPublisher;

    public OrderServiceImp(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           OrderRepository orderRepository,
                           OrderItemRepository orderItemRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository,
                           RazorpayService razorpayService,
                           PlatformTransactionManager transactionManager,
                           ApplicationEventPublisher eventPublisher) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.razorpayService = razorpayService;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public OrderResponseDto checkout(Long userId, CheckoutRequestDto request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setShippingAddress(trimToNull(request.getShippingAddress()));
        order.setShippingPincode(trimToNull(request.getPincode()));

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            validateProductForCheckout(product, item.getQuantity());

            BigDecimal price = product.getPrice();
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getProductName());
            orderItem.setPriceAtPurchase(price);
            orderItem.setQuantity(item.getQuantity());
            orderItem.setLineTotal(lineTotal);

            order.getItems().add(orderItem);
            total = total.add(lineTotal);
        }

        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);

        cartItemRepository.deleteByCartId(cart.getId());
        return mapToOrderResponse(savedOrder, order.getItems());
    }

    @Override
    @Transactional
    public OrderResponseDto confirmPayment(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Order is not pending payment");
        }

        return finalizePayment(order, OrderStatusChangeSource.USER);
    }

    @Override
    @Transactional
    public OrderResponseDto cancelOrder(Long userId, Long orderId, OrderCancelRequestDto request) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        OrderStatus status = order.getStatus();
        if (status == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }
        if (status == OrderStatus.DELIVERED || status == OrderStatus.FAILED) {
            throw new BadRequestException("Delivered or failed orders cannot be cancelled");
        }
        if (status != OrderStatus.PENDING_PAYMENT
                && status != OrderStatus.PAID
                && status != OrderStatus.PROCESSING
                && status != OrderStatus.SHIPPED) {
            throw new BadRequestException("Order cannot be cancelled at its current status");
        }

        String reason = trimToNull(request != null ? request.getReason() : null);
        order.setCancelReason(reason);
        order.setStatus(OrderStatus.CANCELLED);

        if (status == OrderStatus.PAID || status == OrderStatus.PROCESSING) {
            restoreStock(order);
        }

        Order saved = orderRepository.save(order);
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return mapToOrderResponse(saved, items);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getMyOrders(Long userId, int offset, int limit) {
        validatePagination(offset, limit);

        PageRequest pageable = PageRequest.of(
                offset,
                limit,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return orderRepository.findByUserId(userId, pageable)
                .stream()
                .map(order -> mapToOrderResponse(order, orderItemRepository.findByOrderId(order.getId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return mapToOrderResponse(order, items);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getAllOrders(int offset, int limit, OrderStatus status) {
        validatePagination(offset, limit);

        PageRequest pageable = PageRequest.of(
                offset,
                limit,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        List<Order> orders = status == null
                ? orderRepository.findAll(pageable).getContent()
                : orderRepository.findByStatus(status, pageable);

        return orders.stream()
                .map(order -> mapToOrderResponse(order, orderItemRepository.findByOrderId(order.getId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto getOrderByIdForAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return mapToOrderResponse(order, items);
    }

    @Override
    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, OrderStatusUpdateRequestDto request) {
        OrderStatus nextStatus = request.getStatus();
        if (nextStatus == null) {
            throw new BadRequestException("Status is required");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        OrderStatus previousStatus = order.getStatus();
        validateAdminStatusTransition(order.getStatus(), nextStatus);
        order.setStatus(nextStatus);

        Order saved = orderRepository.save(order);
        publishStatusChange(saved, previousStatus, nextStatus, OrderStatusChangeSource.ADMIN);
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return mapToOrderResponse(saved, items);
    }

    @Override
    @Transactional
    public OrderResponseDto cancelOrderByAdmin(Long orderId, AdminOrderCancelRequestDto request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
            return mapToOrderResponse(order, items);
        }

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Shipped or delivered orders cannot be cancelled");
        }

        order.setCancelReason(trimToNull(request.getReason()));

        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.PROCESSING) {
            restoreStock(order);
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        publishStatusChange(saved, previousStatus, OrderStatus.CANCELLED, OrderStatusChangeSource.ADMIN);
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return mapToOrderResponse(saved, items);
    }

    @Override
    @Transactional
    public RazorpayOrderResponseDto createRazorpayOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Order is not pending payment");
        }

        if (order.getRazorpayOrderId() != null && !order.getRazorpayOrderId().isBlank()) {
            return razorpayService.buildResponse(order);
        }

        RazorpayOrderResponseDto response = razorpayService.createRazorpayOrder(order);
        order.setRazorpayOrderId(response.getRazorpayOrderId());
        orderRepository.save(order);
        return response;
    }

    @Override
    @Transactional
    public OrderResponseDto verifyRazorpayPayment(Long userId, Long orderId, RazorpayPaymentVerifyRequestDto request) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Order is not pending payment");
        }

        if (order.getRazorpayOrderId() == null || !order.getRazorpayOrderId().equals(request.getRazorpayOrderId())) {
            throw new BadRequestException("Razorpay order id does not match");
        }

        boolean valid = razorpayService.verifyPaymentSignature(request);
        if (!valid) {
            throw new BadRequestException("Invalid Razorpay payment signature");
        }

        order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        order.setRazorpaySignature(request.getRazorpaySignature());
        orderRepository.save(order);

        return finalizePayment(order, OrderStatusChangeSource.USER);
    }

    @Override
    public void reconcilePendingPayments(int batchSize, LocalDateTime cutoff) {
        if (batchSize <= 0) {
            return;
        }

        List<Order> candidates = orderRepository
                .findByStatusAndRazorpayOrderIdIsNotNullAndCreatedAtBefore(
                        OrderStatus.PENDING_PAYMENT,
                        cutoff,
                        PageRequest.of(0, batchSize, Sort.by(Sort.Direction.ASC, "createdAt")));

        for (Order order : candidates) {
            String paymentId = razorpayService.findCapturedPaymentId(order.getRazorpayOrderId());
            if (paymentId == null) {
                continue;
            }

            try {
                transactionTemplate.execute(status -> {
                    Order fresh = orderRepository.findById(order.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

                    if (fresh.getStatus() != OrderStatus.PENDING_PAYMENT) {
                        return null;
                    }

                    if (fresh.getRazorpayPaymentId() == null || fresh.getRazorpayPaymentId().isBlank()) {
                        fresh.setRazorpayPaymentId(paymentId);
                    }

                    finalizePayment(fresh, OrderStatusChangeSource.SYSTEM);
                    return null;
                });
            } catch (Exception ex) {
                LOGGER.warn("Razorpay reconciliation failed for order {}: {}", order.getId(), ex.getMessage());
            }
        }
    }

    private void validateProductForCheckout(Product product, Integer quantity) {
        if (product.getStatus() == ProductStatus.INACTIVE) {
            throw new BadRequestException("Product is not available");
        }
        if (product.getStockQuantity() == null || product.getStockQuantity() <= 0) {
            throw new BadRequestException("Product is out of stock");
        }
        if (quantity != null && product.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock for product: " + product.getProductName());
        }
    }

    private void validateProductForPayment(Product product, Integer quantity) {
        if (product.getStatus() == ProductStatus.INACTIVE) {
            throw new BadRequestException("Product is not available");
        }
        if (product.getStockQuantity() == null || product.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock for product: " + product.getProductName());
        }
    }

    private void validatePagination(int offset, int limit) {
        if (offset < 0) {
            throw new BadRequestException("Offset must be >= 0");
        }
        if (limit <= 0) {
            throw new BadRequestException("Limit must be > 0");
        }
    }

    private OrderResponseDto mapToOrderResponse(Order order, List<OrderItem> items) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCancelReason(order.getCancelReason());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setShippingPincode(order.getShippingPincode());
        dto.setCreatedAt(order.getCreatedAt());

        List<OrderItemResponseDto> itemDtos = items.stream()
                .map(this::mapToOrderItem)
                .collect(Collectors.toList());
        dto.setItems(itemDtos);
        return dto;
    }

    private OrderResponseDto finalizePayment(Order order, OrderStatusChangeSource source) {
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        if (items.isEmpty()) {
            throw new BadRequestException("Order has no items");
        }

        for (OrderItem item : items) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            validateProductForPayment(product, item.getQuantity());

            int updatedStock = product.getStockQuantity() - item.getQuantity();
            product.setStockQuantity(updatedStock);
            if (updatedStock == 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            } else if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
                product.setStatus(ProductStatus.ACTIVE);
            }
            productRepository.save(product);
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.PAID);
        Order saved = orderRepository.save(order);
        publishStatusChange(saved, previousStatus, OrderStatus.PAID, source);
        return mapToOrderResponse(saved, items);
    }

    private void validateAdminStatusTransition(OrderStatus current, OrderStatus next) {
        if (current == OrderStatus.CANCELLED || current == OrderStatus.FAILED) {
            throw new BadRequestException("Cancelled or failed orders cannot be updated");
        }

        if (next == OrderStatus.CANCELLED || next == OrderStatus.PENDING_PAYMENT || next == OrderStatus.FAILED) {
            throw new BadRequestException("Use the cancel endpoint for cancellation");
        }

        if (next == OrderStatus.PAID) {
            throw new BadRequestException("Payment status is controlled by payment verification");
        }

        if (next == OrderStatus.PROCESSING && current != OrderStatus.PAID) {
            throw new BadRequestException("Only paid orders can be moved to processing");
        }

        if (next == OrderStatus.SHIPPED && current != OrderStatus.PROCESSING) {
            throw new BadRequestException("Only processing orders can be moved to shipped");
        }

        if (next == OrderStatus.DELIVERED && current != OrderStatus.SHIPPED) {
            throw new BadRequestException("Only shipped orders can be moved to delivered");
        }
    }

    private void restoreStock(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        for (OrderItem item : items) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            int nextStock = product.getStockQuantity() + item.getQuantity();
            product.setStockQuantity(nextStock);

            if (nextStock > 0 && product.getStatus() == ProductStatus.OUT_OF_STOCK) {
                product.setStatus(ProductStatus.ACTIVE);
            }

            productRepository.save(product);
        }
    }

    private OrderItemResponseDto mapToOrderItem(OrderItem item) {
        OrderItemResponseDto dto = new OrderItemResponseDto();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
        dto.setProductName(item.getProductName());
        dto.setPriceAtPurchase(item.getPriceAtPurchase());
        dto.setQuantity(item.getQuantity());
        dto.setLineTotal(item.getLineTotal());
        return dto;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void publishStatusChange(Order order, OrderStatus previous, OrderStatus next, OrderStatusChangeSource source) {
        if (eventPublisher == null) {
            return;
        }
        if (order == null || next == null) {
            return;
        }

        String productSummary = null;
        try {
            productSummary = buildProductSummary(order.getId());
        } catch (Exception ignored) {
            productSummary = null;
        }

        String email = null;
        try {
            email = order.getUser() != null ? order.getUser().getEmail() : null;
        } catch (Exception ignored) {
            email = null;
        }
        if (email == null || email.isBlank()) {
            return;
        }

        eventPublisher.publishEvent(new OrderStatusChangedEvent(
                order.getId(),
                productSummary,
                email,
                previous,
                next,
                source != null ? source : OrderStatusChangeSource.SYSTEM,
                order.getTotalAmount(),
                order.getShippingAddress(),
                order.getShippingPincode(),
                order.getCancelReason()
        ));
    }

    private String buildProductSummary(Long orderId) {
        if (orderId == null) {
            return null;
        }
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        if (items == null || items.isEmpty()) {
            return null;
        }

        List<String> names = items.stream()
                .map(OrderItem::getProductName)
                .map(this::trimToNull)
                .filter(name -> name != null)
                .distinct()
                .collect(Collectors.toList());

        if (names.isEmpty()) {
            return null;
        }
        if (names.size() == 1) {
            return names.get(0);
        }

        return names.get(0) + " and " + (names.size() - 1) + " more item(s)";
    }
}
