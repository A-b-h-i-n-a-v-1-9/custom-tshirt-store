const db = require('../db');

// Reduce stock when an order is placed
exports.reduceStock = (productType, productId, quantity, callback) => {
    db.getConnection((err, connection) => {
        if (err) return callback(err, null);

        connection.beginTransaction(err => {
            if (err) return callback(err, null);

            // Reduce stock from the inventory
            connection.query(
                'UPDATE inventory SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
                [quantity, productId, quantity],
                (err, result) => {
                    if (err) return connection.rollback(() => callback(err, null));

                    if (result.affectedRows === 0) {
                        return connection.rollback(() => callback("Not enough stock available", null));
                    }

                    connection.commit(err => {
                        if (err) return callback(err, null);
                        callback(null, { message: "Stock updated successfully!" });
                    });
                }
            );
        });

        connection.release();
    });
};

// Add a new T-shirt
exports.addTShirt = (tshirtData, callback) => {
    const { size, material, price, color, quantity } = tshirtData;

    db.getConnection((err, connection) => {
        if (err) return callback(err, null);

        connection.beginTransaction(err => {
            if (err) return callback(err, null);

            connection.query(
                'INSERT INTO inventory (type, quantity) VALUES (?, ?)',
                ['tshirt', quantity],
                (err, result) => {
                    if (err) return connection.rollback(() => callback(err, null));

                    const inventoryId = result.insertId;

                    connection.query(
                        'INSERT INTO t_shirts (inventory_id, size, material, price, color) VALUES (?, ?, ?, ?, ?)',
                        [inventoryId, size, material, price, color],
                        (err) => {
                            if (err) return connection.rollback(() => callback(err, null));

                            connection.commit(err => {
                                if (err) return callback(err, null);
                                callback(null, { message: "T-Shirt added successfully!" });
                            });
                        }
                    );
                }
            );
        });

        connection.release();
    });
};

// Add a new Mug
exports.addMug = (mugData, callback) => {
    const { size, price, color, quantity } = mugData;

    db.getConnection((err, connection) => {
        if (err) return callback(err, null);

        connection.beginTransaction(err => {
            if (err) return callback(err, null);

            connection.query(
                'INSERT INTO inventory (type, quantity) VALUES (?, ?)',
                ['mug', quantity],
                (err, result) => {
                    if (err) return connection.rollback(() => callback(err, null));

                    const inventoryId = result.insertId;

                    connection.query(
                        'INSERT INTO mugs (inventory_id, size, price, color) VALUES (?, ?, ?, ?)',
                        [inventoryId, size, price, color],
                        (err) => {
                            if (err) return connection.rollback(() => callback(err, null));

                            connection.commit(err => {
                                if (err) return callback(err, null);
                                callback(null, { message: "Mug added successfully!" });
                            });
                        }
                    );
                }
            );
        });

        connection.release();
    });
};

// Add a new Bottle
exports.addBottle = (bottleData, callback) => {
    const { size_ml, material, price, color, quantity } = bottleData;

    db.getConnection((err, connection) => {
        if (err) return callback(err, null);

        connection.beginTransaction(err => {
            if (err) return callback(err, null);

            connection.query(
                'INSERT INTO inventory (type, quantity) VALUES (?, ?)',
                ['bottle', quantity],
                (err, result) => {
                    if (err) return connection.rollback(() => callback(err, null));

                    const inventoryId = result.insertId;

                    connection.query(
                        'INSERT INTO bottles (inventory_id, size_ml, material, price, color) VALUES (?, ?, ?, ?, ?)',
                        [inventoryId, size_ml, material, price, color],
                        (err) => {
                            if (err) return connection.rollback(() => callback(err, null));

                            connection.commit(err => {
                                if (err) return callback(err, null);
                                callback(null, { message: "Bottle added successfully!" });
                            });
                        }
                    );
                }
            );
        });

        connection.release();
    });
};
