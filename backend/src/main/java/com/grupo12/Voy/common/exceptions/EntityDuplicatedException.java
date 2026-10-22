package com.grupo12.Voy.common.exceptions;

public class EntityDuplicatedException extends RuntimeException {
    public EntityDuplicatedException(String message) {
        super(message);
    }
}
