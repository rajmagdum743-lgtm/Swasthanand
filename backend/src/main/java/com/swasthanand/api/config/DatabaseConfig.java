package com.swasthanand.api.config;

import com.swasthanand.api.model.User;
import com.swasthanand.api.model.Product;
import com.swasthanand.api.model.Order;
import com.swasthanand.api.model.FarmBatch;
import com.swasthanand.api.model.DealershipNode;
import org.reactivestreams.Publisher;
import org.springframework.data.r2dbc.mapping.event.AfterConvertCallback;
import org.springframework.data.r2dbc.mapping.OutboundRow;
import org.springframework.data.r2dbc.mapping.event.AfterSaveCallback;
import org.springframework.data.relational.core.sql.SqlIdentifier;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class DatabaseConfig implements AfterConvertCallback<Object>, AfterSaveCallback<Object> {
    @Override
    public Publisher<Object> onAfterConvert(Object entity, SqlIdentifier table) {
        setNotNew(entity);
        return Mono.just(entity);
    }

    @Override
    public Publisher<Object> onAfterSave(Object entity, OutboundRow row, SqlIdentifier table) {
        setNotNew(entity);
        return Mono.just(entity);
    }

    private void setNotNew(Object entity) {
        if (entity instanceof User) {
            ((User) entity).setNew(false);
        } else if (entity instanceof Product) {
            ((Product) entity).setNew(false);
        } else if (entity instanceof Order) {
            ((Order) entity).setNew(false);
        } else if (entity instanceof FarmBatch) {
            ((FarmBatch) entity).setNew(false);
        } else if (entity instanceof DealershipNode) {
            ((DealershipNode) entity).setNew(false);
        }
    }
}
