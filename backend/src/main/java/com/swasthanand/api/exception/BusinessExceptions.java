package com.swasthanand.api.exception;

public class BusinessExceptions {

    public static class BusinessException extends RuntimeException {
        public BusinessException(String message) {
            super(message);
        }
    }

    public static class InventoryException extends BusinessException {
        public InventoryException(String message) {
            super(message);
        }
    }

    public static class BatchException extends BusinessException {
        public BatchException(String message) {
            super(message);
        }
    }

    public static class DealerException extends BusinessException {
        public DealerException(String message) {
            super(message);
        }
    }
}
