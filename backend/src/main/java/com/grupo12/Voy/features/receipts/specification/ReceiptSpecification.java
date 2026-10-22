package com.grupo12.Voy.features.receipts.specification;

import com.grupo12.Voy.features.receipts.models.ReceiptEntity;
import org.springframework.data.jpa.domain.PredicateSpecification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class ReceiptSpecification {

    public static PredicateSpecification<ReceiptEntity> externalIdEqual(UUID externalId) {
        return ((root, cb) -> externalId == null ?
                cb.conjunction() :
                cb.equal(root.get("externalId"), externalId));
    }

    public static PredicateSpecification<ReceiptEntity> userExtIdEqual(UUID userExtId) {
        return ((root, cb) -> userExtId == null ?
                cb.conjunction() :
                cb.equal(root.get("user").get("externalId"), userExtId));
    }

    public static PredicateSpecification<ReceiptEntity> paymentMethodContains(String paymentMethod) {
        return (root, cb) -> paymentMethod == null || paymentMethod.isBlank() ?
                cb.conjunction() :
                cb.like(cb.lower(root.get("paymentMethod")), "%" + paymentMethod.toLowerCase() + "%");
    }

    public static PredicateSpecification<ReceiptEntity> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, cb) -> {
            if (min == null && max == null) return cb.conjunction();
            if (min == null) return cb.lessThanOrEqualTo(root.get("price"), max);
            if (max == null) return cb.greaterThanOrEqualTo(root.get("price"), min);
            return cb.between(root.get("price"), min, max);
        };
    }

    public static PredicateSpecification<ReceiptEntity> finalPriceBetween(BigDecimal min, BigDecimal max) {
        return (root, cb) -> {
            if (min == null && max == null) return cb.conjunction();
            if (min == null) return cb.lessThanOrEqualTo(root.get("finalPrice"), max);
            if (max == null) return cb.greaterThanOrEqualTo(root.get("finalPrice"), min);
            return cb.between(root.get("finalPrice"), min, max);
        };
    }

    public static PredicateSpecification<ReceiptEntity> paymentDateBetween(LocalDateTime from, LocalDateTime to) {
        return (root, cb) -> {
            if (from == null && to == null) return cb.conjunction();
            if (from == null) return cb.lessThanOrEqualTo(root.get("paymentDate"), to);
            if (to == null) return cb.greaterThanOrEqualTo(root.get("paymentDate"), from);
            return cb.between(root.get("paymentDate"), from, to);
        };
    }

    public static PredicateSpecification<ReceiptEntity> quantityBetween(Integer min, Integer max) {
        return (root, cb) -> {
            if (min == null && max == null) return cb.conjunction();
            if (min == null) return cb.lessThanOrEqualTo(root.get("quantity"), max);
            if (max == null) return cb.greaterThanOrEqualTo(root.get("quantity"), min);
            return cb.between(root.get("quantity"), min, max);
        };
    }
}
