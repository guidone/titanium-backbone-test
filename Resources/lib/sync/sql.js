var _ = require("lib/underscore")._, db;

function S4() {
    return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
}

function guid() {
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function column(name) {
    switch (name) {
      case "string":
      case "varchar":
      case "text":
        return "TEXT";
      case "int":
      case "tinyint":
      case "smallint":
      case "bigint":
      case "integer":
        return "INTEGER";
      case "double":
      case "float":
      case "real":
        return "REAL";
      case "blob":
        return "BLOB";
      case "decimal":
      case "number":
      case "date":
      case "datetime":
      case "boolean":
        return "NUMERIC";
      case "null":
        return "NULL";
    }   
    return "TEXT";
}

function createTable(table_name, columns) {
    var _columns = [];

    for (var k in columns) _columns.push(k + " " + column(columns[k]));
    var sql = "CREATE TABLE IF NOT EXISTS " + table_name + " ( " + _columns.join(",") + ",id" + " )";
    Ti.API.debug(sql);
    
    db.execute(sql);
}

function Sync(method, model, opts) {

    Ti.API.debug(model);
    var table = model.table_name || model.collection.table_name;
    var columns = model.columns || model.collection.columns;
    var resp = null;

    db = Ti.Database.open("_alloy_");

    if (columns && table) {
        createTable(table, columns);
    }

    switch (method) {
      case "create":
        var names = [], values = [], q = [];
        for (var k in columns) {
            names.push(k);
            values.push(model.get(k));
            q.push("?");
        }
        var id = guid(), sql = "INSERT INTO " + table + " (" + names.join(",") + ",id) VALUES (" + q.join(",") + ",?)";
        values.push(id);
        db.execute(sql, values);
        model.id = id;
        resp = model.toJSON();
        break;
      case "read":
        var sql = "SELECT * FROM " + table, rs = db.execute(sql), len = 0, values = [];
        while (rs.isValidRow()) {
            var o = {}, fc = 0;
            fc = _.isFunction(rs.fieldCount) ? rs.fieldCount() : rs.fieldCount;
            _.times(fc, function(c) {
                var fn = rs.fieldName(c);
                o[fn] = rs.fieldByName(fn);
            });
            values.push(o);
            len++;
            rs.next();
        }
        rs.close();
        model.length = len;
        len === 1 ? resp = values[0] : resp = values;
        break;
      case "update":
        var names = [], values = [], q = [];
        for (var k in columns) {
            names.push(k + "=?");
            values.push(model.get(k));
            q.push("?");
        }
        var sql = "UPDATE " + table + " SET " + names.join(",") + " WHERE id=?", e = sql + "," + values.join(",") + "," + model.id;
        values.push(model.id);
        db.execute(sql, values);
        resp = model.toJSON();
        break;
      case "delete":
        var sql = "DELETE FROM " + table + " WHERE id=?";
        db.execute(sql, model.id);
        model.id = null;
        resp = model.toJSON();
    }
    if (resp) {
        _.isFunction(opts.success) && opts.success(resp);
        method === "read" && model.trigger("fetch");
    } else _.isFunction(opts.error) && opts.error("Record not found");
}

module.exports.sync = Sync;
