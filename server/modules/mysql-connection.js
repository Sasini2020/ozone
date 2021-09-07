const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit : 10,
  host: 'localhost',
  user: 'vishwa',
  password: 'Vishwa1235#',
  database: 'ozone',
  multipleStatements: true,
  typeCast: function castField( field, useDefaultTypeCasting ) {
    if ( ( field.type === "BIT" ) && ( field.length === 1 ) ) {
      var bytes = field.buffer();
      return( bytes[ 0 ] === 1 );
    }
    return( useDefaultTypeCasting() );

  }
});

exports.pool = pool;
