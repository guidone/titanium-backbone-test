class Database
  constructor:(table_name, auto_increment)->
    @table_name = table_name
    @properties = []
    @columns = []
    @auto_increment = auto_increment
    if auto_increment
      @auto_increment = false
    else
      @auto_increment = true
      @properties.push {name:'id', type:'INTEGER PRIMARY KEY AUTOINCREMENT'}
      @columns.push 'id'
    @properties.push {name:'created_at', type:'datetime'}
    @properties.push {name:'updated_at', type:'datetime'}
    @columns.push 'created_at'
    @columns.push 'updated_at'
    if Ti.Platform.osname == 'android'
      @db = Ti.Database.install('/myapp.db', 'my_app')
    else
      @db = Ti.Database.install('myapp.db', 'my_app')
    @initialize()

  property:(name, type)->
    if @auto_increment && name == 'id'
      return
    if name != 'updated_at' && name != 'created_at'
      @properties.push {name:name, type:type}
      @columns.push name

  initialize:()->
    # table properties are set in descendant class here
    @init()

  init:()->
    sql = "CREATE TABLE IF NOT EXISTS " + @table_name + " ("
    for data, i in @properties
      table_name = data.name
      table_type = data.type
      add = table_name + " " + table_type
      sql += add if i == 0
      sql += "," + add if i > 0
    sql += ");"

    @db.execute sql

  transaction:(fn)->
    # 使えるのこれ？
    if Ti.Platform.osname != 'android'
      @db.execute "BEGIN"
    res = fn()
    if res && Ti.Platform.osname != 'android'
      @db.execute "COMMIT"
    else if Ti.Platform.osname != 'android'
      @db.execute "ROLLBACK"

  create:(data)->
    self = new Object()
    if data
      for name in @columns
        self[name] = data[name]
    self.save = ()=>
      params = new Object()
      for p in @columns
        params[p] = self[p]
      if data && data.id && @find_by_id(data.id)
        @update params
      else
        @save params
    self

  save:(params)->
    params.created_at = '' if !params.created_at
    params.updated_at = '' if !params.updated_at
    
    values = []
    columns = []
    data = []
    for name, id in @columns
      continue if @auto_increment && name == 'id'
      columns.push name
      if name == 'created_at' or name == 'updated_at'
        values.push "datetime('now', 'localtime')"
      else
        values.push '?'
        if params[name]
          data.push params[name]
        else
          data.push null

    sql = "INSERT INTO " + @table_name + "(" + columns.join(',') + ") VALUES (" + values.join(',') + ");"
    return @db.execute(sql, data)

  read:(sql, data)->
    if Ti.Platform.osname != 'android'
      @db.execute "BEGIN"

    if data
      resultSet = @db.execute sql, data
    else
      resultSet = @db.execute sql
    results = []
    while resultSet.isValidRow()
      result = {}
      for name in @columns
        result[name] = resultSet.fieldByName name
      result.save = @_update(result)
      result.destroy = @_destroy(result)
      results.push result
      resultSet.next()
    resultSet.close()
    if Ti.Platform.osname != 'android'
      @db.execute "COMMIT"
    results
    
  find:(params)->
    sql = "SELECT * FROM " + @table_name
    keys = []
    vals = []
    orderby = ""
    for key, value of params
      if key == 'order'
        orderby = " ORDER BY " + value
      else
        keys.push key
        vals.push value

    if keys.length > 0
      sql += " WHERE "
      wheres = []
      for key in keys
        wheres.push key + " = ?"
      sql += wheres.join(',')
    sql += orderby
    return @read(sql, vals)

  first:()->
    sql = "SELECT * FROM " + @table_name + " ORDER BY id DESC LIMIT 1"
    data = @read(sql)
    return data[0]

  last:()->
    sql = "SELECT * FROM " + @table_name + " ORDER BY id ASC LIMIT 1"
    data = @read(sql)
    return data[0]

  all:()->
    sql = "SELECT * FROM " + @table_name + " ORDER BY id DESC"
    return @read(sql)

  find_by_id:(id)->
    sql = "SELECT * FROM " + @table_name + " WHERE id = ?"
    data = @read(sql, id)
    return data[0]

  create_if_not_exist:(params)->
    data = @find_by_id(params.id)
    if data
      return false
    else
      return @save(params)

  update:(params)->
    params.updated_at = '' if !params.updated_at
    sql = "UPDATE " + @table_name + " "
    setter = []
    values = []
    for key, value of params
      if key == 'id'
        # don't never update your primary key
        id = value
        continue
      else if key == 'updated_at'
        setter.push key + " = datetime('now', 'localtime')"
      else
        setter.push key + " = ?"
        values.push value
    values.push id
    sql += " SET " + setter.join(',')
    sql += " WHERE id = ?"
    return @db.execute(sql, values)

  destroy:(params)->
    sql = "DELETE FROM " + @table_name + " WHERE id = ?"
    return @db.execute(sql, params.id)

  _update:(data)->
    self = data
    return ()=>
      params = new Object()
      for p in @columns
        params[p] = self[p]
      @update params
      return

  _destroy:(data)->
    self = data
    return ()=>
      @destroy(data)
      return

 module.exports = Database


