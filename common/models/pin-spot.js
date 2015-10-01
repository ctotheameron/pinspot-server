var _ = require('lodash');

module.exports = function(PinSpot) {
    var PAGE_SIZE = 10;

    PinSpot.nearby = function(here, page, max, cb) {
        page = page || 0;
        max = Number(max || 100000);

        PinSpot.find({
            // find locations near the provided GeoPoint
            where: { loc: { near: here, maxDistance: max }},
            // paging
            skip: PAGE_SIZE * page,
            limit: PAGE_SIZE
        }, cb);
    };

    PinSpot.nearbyPins = function(here, pin, page, max, cb) {
        this.nearby(here, null, max, function(err, res) {
            cb(err, _.filter(res, function(pinSpot) {
                return _.contains(pinSpot.pins, pin);
            }));
        });
    }

    PinSpot.within = function(sw, ne, cb) {
        var box = [ [sw.lat, sw.lng], [ne.lat, ne.lng] ];

        PinSpot.find({
            // find locations within the supplied bbox
            where: { loc: { within: { $box: box }}}
        }, cb);
    }

    PinSpot.setup = function() {
        PinSpot.base.setup.apply(this, arguments);

        this.remoteMethod('nearbyPins', {
            description: 'Find nearby PinSpots containing the requested Pin around the geo point',
            accepts: [
                { arg: 'here', type: 'GeoPoint', required: true, description: 'geo location (lng & lat)' },
                { arg: 'pin', type: 'String', required: true, description: 'Pin'},
                { arg: 'page', type: 'Number', description: 'number of pages (page size=10)' },
                { arg: 'max', type: 'Number', description: 'max distance in miles' }
            ],
            returns: {arg: 'PinSpots', root: true},
            http: { verb: 'GET' }
        });

        this.remoteMethod('nearby', {
            description: 'Find nearby PinSpots around the geo point',
            accepts: [
                { arg: 'here', type: 'GeoPoint', required: true, description: 'geo location (lng & lat)' },
                { arg: 'page', type: 'Number', description: 'number of pages (page size=10)' },
                { arg: 'max', type: 'Number', description: 'max distance in miles' }
            ],
            returns: {arg: 'PinSpots', root: true},
            http: { verb: 'GET' }
        });

        this.remoteMethod('within', {
            description: 'Find PinSpots within the bounding box',
            accepts: [
                {arg: 'southWest', type: 'GeoPoint', required: true, description: 'sw geo location (lat & lng)'},
                {arg: 'northEast', type: 'GeoPoint', required: true, description: 'ne geo location (lat & lng)'}
            ],
            returns: {arg: 'PinSpots', root: true},
            http: { verb: 'GET' }
        });
    };

    PinSpot.setup();
};
