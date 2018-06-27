const { ErrorHelper, Models } = require('borderline-utils');
const ObjectID = require('mongodb').ObjectID;
const defines = require('../defines.js');

/**
 * @fn QueryController
 * @desc Controller for queries inputs management.
 * @param queryCollection MongoDb collection where the queries are stored
 * @param queryGridFS MongoDB grid fs collection where the data is stored
 * @constructor
 */
function QueryController(queryCollection) {
    this.queryCollection = queryCollection;

    //Bind member functions to this instance
    this.getNewQuery = QueryController.prototype.getNewQuery.bind(this);
    this.postNewQuery = QueryController.prototype.postNewQuery.bind(this);
    this.postNewQueryTyped = QueryController.prototype.postNewQueryTyped.bind(this);
    this.deleteQueryById = QueryController.prototype.deleteQueryById.bind(this);
    this.getQueryById = QueryController.prototype.getQueryById.bind(this);
    this.postQueryById = QueryController.prototype.postQueryById.bind(this);
}

/**
 * @fn getNewQuery
 * @param req Express.js request object
 * @param res Express.js response object
 */
QueryController.prototype.getNewQuery = function (__unused__req, res) {
    let newQuery = Object.assign({}, Models.BL_MODEL_QUERY, {
        endpoint: Models.BL_MODEL_DATA_SOURCE
    });

    this.queryCollection.insertOne(newQuery).then(function (r) {
        if (r.insertedCount === 1) {
            res.status(200);
            res.json(r.ops[0]);
        }
        else {
            res.status(401);
            res.json({ error: 'Insert a new empty query failed' });
        }
    }, function (error) {
        res.status(501);
        res.json({ error: error });
    });
};

/**
 * @fn postNewQuery
 * @param req Express.js request object
 * @param res Express.js response object
 */
QueryController.prototype.postNewQuery = function (req, res) {
    let credentials = req.body.credentials;
    let endpoint = req.body.endpoint;
    if (endpoint === null || endpoint === undefined ||
        credentials === null || credentials === undefined) {
        res.status(401);
        res.json(ErrorHelper('Missing query data'));
        return;
    }
    if (defines.endpointTypes.find(function (v) { return v === endpoint.type; }) === undefined) {
        res.status(401);
        res.json(ErrorHelper('Invalid source type'));
        return;
    }
    let newQuery = Object.assign({}, Models.BL_MODEL_QUERY, req.body);

    this.queryCollection.insertOne(newQuery).then(function (r) {
        if (r.insertedCount === 1) {
            res.status(200);
            res.json(r.ops[0]);
        }
        else {
            res.status(401);
            res.json(ErrorHelper('Insert a new query failed'));
        }
    }, function (error) {
        res.status(500);
        res.json(ErrorHelper(error));
    });
};

/**
 * @fn postNewQueryTyped
 * @param req Express.js request object. Must contain query_type parameter
 * @param res Express.js response object
 */
QueryController.prototype.postNewQueryTyped = function (req, res) {
    let query_type = req.params.query_type;

    if (defines.endpointTypes.includes(query_type) === false) {
        res.status(400);
        res.json(ErrorHelper('Unknown query type'));
        return;
    }

    let endpointModel = Object.assign({}, Models.BL_MODEL_DATA_SOURCE, { type: query_type });
    //Create new query from here
    let newQuery = Object.assign({}, Models.BL_MODEL_QUERY, { endpoint: endpointModel }, req.body);
    this.queryCollection.insertOne(newQuery).then(function (r) {
        if (r.insertedCount === 1) {
            res.status(200);
            res.json(r.ops[0]);
        }
        else {
            res.status(401);
            res.json(ErrorHelper('Insert a new query failed'));
        }
    }, function (error) {
        res.status(500);
        res.json(ErrorHelper(error));
    });
};

/**
 * @fn getQueryById
 * @desc Getter on a query model from its unique identifier.
 * @param req Express.js request object. Must contain query_id parameter
 * @param res Express.js response object
 */
QueryController.prototype.getQueryById = function (req, res) {
    let query_id = req.params.query_id;
    if (query_id === undefined || query_id === null) {
        res.statusCode(404);
        res.json(ErrorHelper('Missing query_id'));
        return;
    }

    try {
        this.queryCollection.findOne({ _id: new ObjectID(query_id) }).then(function (query_data) {
            res.status(200);
            res.json(query_data);
        }, function (error) {
            res.status(500);
            res.json(ErrorHelper('Failed to find query', error));
        });
    }
    catch (error) { // ObjectID creation might throw
        res.status(500);
        res.json(ErrorHelper('Cannot get query data', error));
    }
};

/**
 * @fn postQueryById
 * @desc Updates query model from its unique identifier.
 * @param req Express.js request object. Must contain query_id and data to update
 * @param res Express.js response object
 */
QueryController.prototype.postQueryById = function (req, res) {
    let query_id = req.params.query_id;
    let query_data = req.body;
    if (query_id === undefined || query_id === null) {
        res.statusCode(404);
        res.json(ErrorHelper('Missing query_id'));
        return;
    }
    if (query_data === null || query_data === undefined) {
        res.statusCode(400);
        res.json(ErrorHelper('Missing query data'));
        return;
    }

    try {
        let query_update = Object.assign({}, Models.BL_MODEL_QUERY, query_data);
        delete query_update._id; // Let mongo handle ids
        this.queryCollection.findOneAndReplace({ _id: new ObjectID(query_id) }, query_update, { returnOriginal: false }).then(function (query_data) {
            res.status(200);
            res.json(query_data);
        }, function (error) {
            res.status(500);
            res.json(ErrorHelper('Failed to find query', error));
        });
    }
    catch (error) { // ObjectID creation might throw
        res.status(500);
        res.json(ErrorHelper('Error occurred while updating', error));
    }
};

/**
 * @fn deleteQueryById
 * @desc Removes a query model based on its unique identifier.
 * @param req Express.js request object. Must contain query_id parameter
 * @param res Express.js response object
 */
QueryController.prototype.deleteQueryById = function (req, res) {
    let query_id = req.params.query_id;
    if (query_id === undefined || query_id === null) {
        res.statusCode(404);
        res.json(ErrorHelper('Missing query_id'));
        return;
    }
    try {
        this.queryCollection.findOneAndDelete({ _id: new ObjectID(query_id) }).then(function (__unused__ok_delete) {
            res.status(200);
            res.json({ success: true });
        }, function (error) {
            res.status(500);
            res.json(ErrorHelper('Failed to delete query', error));
        });
    }
    catch (error) { // ObjectID creation might throw
        res.status(500);
        res.json(ErrorHelper('Error occurred while deleting', error));
    }
};


module.exports = QueryController;
