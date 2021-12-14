var mysql = require("mysql");
var config = require("./config.json");
var datas = [];
var pool = mysql.createPool({
    host: config.dbhost,
    user: config.dbuser,
    password: config.dbpassword,
    database: config.dbname,
});
exports.handler = (event, context, callback) => {
    if (event.func == "count") {
        let type = event.params.querystring.type;
        let startingDate = event.params.querystring.startingdate;
        let endingDate = event.params.querystring.endingdate; //Date example: '2009-10-20 00:00:00'
        var sqlCommand = "SELECT COUNT(*) AS count FROM northwind.Device ";
        var startingEndingCommand =
            " northwind.Device.RegistrationDate BETWEEN " +
            "'" +
            startingDate +
            "'" +
            " AND " +
            "'" +
            endingDate +
            "'";
        var typeCommand = " WHERE northwind.Device.Type = '" + type + "'";
        var startingCommand =
            " northwind.Device.RegistrationDate = " + "'" + startingDate + "'";

        if (
            type == undefined &&
            startingDate == undefined &&
            endingDate == undefined
        ) {} else if (
            type != undefined &&
            startingDate != undefined &&
            endingDate == undefined
        ) {
            sqlCommand = sqlCommand + typeCommand + " AND " + startingCommand;
        } else if (
            type != undefined &&
            startingDate != undefined &&
            endingDate != undefined
        ) {
            sqlCommand = sqlCommand + typeCommand + " AND " + startingEndingCommand;
        } else if (
            type == undefined &&
            startingDate != undefined &&
            endingDate != undefined
        ) {
            sqlCommand = sqlCommand + "WHERE " + startingEndingCommand;
        } else if (
            type == undefined &&
            startingDate != undefined &&
            endingDate == undefined
        ) {
            sqlCommand = sqlCommand + " WHERE " + startingCommand;
        } else if (
            type != undefined &&
            startingDate == undefined &&
            endingDate == undefined
        ) {
            sqlCommand = sqlCommand + typeCommand;
        }
        context.callbackWaitsForEmptyEventLoop = false;
        pool.getConnection(function(err, connection) {
            // Use the connection
            connection.query(sqlCommand, function(error, results, fields) {
                // And done with the connection.
                connection.release();
                // Handle error after the release.
                if (error) callback(error);
                else {
                    datas = [];
                    results.forEach((element) => {
                        datas.push(element);
                    });

                    callback(null, datas);
                }
            });
        });
    } else if (event.func == "devices") {
        let page = event.params.querystring.page;
        let count = parseInt(page);
        let type = event.params.querystring.type;
        let startingDate = event.params.querystring.startingdate;
        let endingDate = event.params.querystring.endingdate; //Date example: '2009-10-20 00:00:00'

        var sqlCommand = "SELECT * FROM northwind.Device ";
        var startingEndingCommand =
            " northwind.Device.RegistrationDate BETWEEN " +
            "'" +
            startingDate +
            "'" +
            " AND " +
            "'" +
            endingDate +
            "'";
        var typeCommand = " WHERE northwind.Device.Type = '" + type + "'";
        var startingCommand =
            " northwind.Device.RegistrationDate = " + "'" + startingDate + "'";
        var limitCommand = " LIMIT " + count * 20 + "," + 20;

        if (
            type == undefined &&
            startingDate == undefined &&
            endingDate == undefined
        ) {
            sqlCommand = sqlCommand + limitCommand;
        } else if (
            type != undefined &&
            startingDate != undefined &&
            endingDate == undefined
        ) {
            sqlCommand =
                sqlCommand + typeCommand + " AND " + startingCommand + limitCommand;
        } else if (
            type != undefined &&
            startingDate != undefined &&
            endingDate != undefined
        ) {
            sqlCommand =
                sqlCommand +
                typeCommand +
                " AND " +
                startingEndingCommand +
                limitCommand;
        } else if (
            type == undefined &&
            startingDate != undefined &&
            endingDate != undefined
        ) {
            sqlCommand =
                sqlCommand + " WHERE " + startingEndingCommand + limitCommand;
        } else if (
            type == undefined &&
            startingDate != undefined &&
            endingDate == undefined
        ) {
            sqlCommand = sqlCommand + " WHERE " + startingCommand + limitCommand;
        } else if (
            type != undefined &&
            startingDate == undefined &&
            endingDate == undefined
        ) {
            sqlCommand = sqlCommand + typeCommand + limitCommand;
        }

        //var sqlCommand = "SELECT * FROM northwind.Device WHERE northwind.Device.Type = 'AC'";
        //prevent timeout from waiting event loop
        context.callbackWaitsForEmptyEventLoop = false;
        pool.getConnection(function(err, connection) {
            // Use the connection
            connection.query(sqlCommand, function(error, results, fields) {
                // And done with the connection.
                connection.release();
                // Handle error after the release.
                if (error) callback(error);
                else {
                    datas = [];
                    results.forEach((element) => {
                        datas.push(element);
                    });
                    callback(null, datas);
                }
            });
        });
    }
};