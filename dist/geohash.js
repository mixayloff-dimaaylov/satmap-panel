'use strict';

System.register([], function (_export, _context) {
  "use strict";

  var BASE32_CODES, BASE32_CODES_DICT, i, ENCODE_AUTO, SIGFIG_HASH_LENGTH, encode, encode_int, decode_bbox, decode_bbox_int, decode, decode_int, neighbor, neighbor_int, neighbors, neighbors_int, bboxes, bboxes_int;


  function get_bit(bits, position) {
    return bits / Math.pow(2, position) & 0x01;
  }

  /**
   * Decode
   *
   * Decode a hash string into pair of latitude and longitude. A javascript object is returned with keys `latitude`,
   * `longitude` and `error`.
   * @param {String} hashString
   * @returns {Object}
   */
  return {
    setters: [],
    execute: function () {
      BASE32_CODES = "0123456789bcdefghjkmnpqrstuvwxyz";
      BASE32_CODES_DICT = {};

      for (i = 0; i < BASE32_CODES.length; i++) {
        BASE32_CODES_DICT[BASE32_CODES.charAt(i)] = i;
      }

      ENCODE_AUTO = 'auto';
      SIGFIG_HASH_LENGTH = [0, 5, 7, 8, 11, 12, 13, 15, 16, 17, 18];

      encode = function encode(latitude, longitude, numberOfChars) {
        if (numberOfChars === ENCODE_AUTO) {
          if (typeof latitude === 'number' || typeof longitude === 'number') {
            throw new Error('string notation required for auto precision.');
          }
          var decSigFigsLat = latitude.split('.')[1].length;
          var decSigFigsLong = longitude.split('.')[1].length;
          var numberOfSigFigs = Math.max(decSigFigsLat, decSigFigsLong);
          numberOfChars = SIGFIG_HASH_LENGTH[numberOfSigFigs];
        } else if (numberOfChars === undefined) {
          numberOfChars = 9;
        }

        var chars = [],
            bits = 0,
            bitsTotal = 0,
            hash_value = 0,
            maxLat = 90,
            minLat = -90,
            maxLon = 180,
            minLon = -180,
            mid;
        while (chars.length < numberOfChars) {
          if (bitsTotal % 2 === 0) {
            mid = (maxLon + minLon) / 2;
            if (longitude > mid) {
              hash_value = (hash_value << 1) + 1;
              minLon = mid;
            } else {
              hash_value = (hash_value << 1) + 0;
              maxLon = mid;
            }
          } else {
            mid = (maxLat + minLat) / 2;
            if (latitude > mid) {
              hash_value = (hash_value << 1) + 1;
              minLat = mid;
            } else {
              hash_value = (hash_value << 1) + 0;
              maxLat = mid;
            }
          }

          bits++;
          bitsTotal++;
          if (bits === 5) {
            var code = BASE32_CODES[hash_value];
            chars.push(code);
            bits = 0;
            hash_value = 0;
          }
        }
        return chars.join('');
      };

      encode_int = function encode_int(latitude, longitude, bitDepth) {

        bitDepth = bitDepth || 52;

        var bitsTotal = 0,
            maxLat = 90,
            minLat = -90,
            maxLon = 180,
            minLon = -180,
            mid,
            combinedBits = 0;

        while (bitsTotal < bitDepth) {
          combinedBits *= 2;
          if (bitsTotal % 2 === 0) {
            mid = (maxLon + minLon) / 2;
            if (longitude > mid) {
              combinedBits += 1;
              minLon = mid;
            } else {
              maxLon = mid;
            }
          } else {
            mid = (maxLat + minLat) / 2;
            if (latitude > mid) {
              combinedBits += 1;
              minLat = mid;
            } else {
              maxLat = mid;
            }
          }
          bitsTotal++;
        }
        return combinedBits;
      };

      decode_bbox = function decode_bbox(hash_string) {
        var isLon = true,
            maxLat = 90,
            minLat = -90,
            maxLon = 180,
            minLon = -180,
            mid;

        var hashValue = 0;
        for (var i = 0, l = hash_string.length; i < l; i++) {
          var code = hash_string[i].toLowerCase();
          hashValue = BASE32_CODES_DICT[code];

          for (var bits = 4; bits >= 0; bits--) {
            var bit = hashValue >> bits & 1;
            if (isLon) {
              mid = (maxLon + minLon) / 2;
              if (bit === 1) {
                minLon = mid;
              } else {
                maxLon = mid;
              }
            } else {
              mid = (maxLat + minLat) / 2;
              if (bit === 1) {
                minLat = mid;
              } else {
                maxLat = mid;
              }
            }
            isLon = !isLon;
          }
        }
        return [minLat, minLon, maxLat, maxLon];
      };

      decode_bbox_int = function decode_bbox_int(hashInt, bitDepth) {

        bitDepth = bitDepth || 52;

        var maxLat = 90,
            minLat = -90,
            maxLon = 180,
            minLon = -180;

        var latBit = 0,
            lonBit = 0;
        var step = bitDepth / 2;

        for (var i = 0; i < step; i++) {

          lonBit = get_bit(hashInt, (step - i) * 2 - 1);
          latBit = get_bit(hashInt, (step - i) * 2 - 2);

          if (latBit === 0) {
            maxLat = (maxLat + minLat) / 2;
          } else {
            minLat = (maxLat + minLat) / 2;
          }

          if (lonBit === 0) {
            maxLon = (maxLon + minLon) / 2;
          } else {
            minLon = (maxLon + minLon) / 2;
          }
        }
        return [minLat, minLon, maxLat, maxLon];
      };

      decode = function decode(hashString) {
        var bbox = decode_bbox(hashString);
        var lat = (bbox[0] + bbox[2]) / 2;
        var lon = (bbox[1] + bbox[3]) / 2;
        var latErr = bbox[2] - lat;
        var lonErr = bbox[3] - lon;
        return { latitude: lat, longitude: lon,
          error: { latitude: latErr, longitude: lonErr } };
      };

      decode_int = function decode_int(hash_int, bitDepth) {
        var bbox = decode_bbox_int(hash_int, bitDepth);
        var lat = (bbox[0] + bbox[2]) / 2;
        var lon = (bbox[1] + bbox[3]) / 2;
        var latErr = bbox[2] - lat;
        var lonErr = bbox[3] - lon;
        return { latitude: lat, longitude: lon,
          error: { latitude: latErr, longitude: lonErr } };
      };

      neighbor = function neighbor(hashString, direction) {
        var lonLat = decode(hashString);
        var neighborLat = lonLat.latitude + direction[0] * lonLat.error.latitude * 2;
        var neighborLon = lonLat.longitude + direction[1] * lonLat.error.longitude * 2;
        return encode(neighborLat, neighborLon, hashString.length);
      };

      neighbor_int = function neighbor_int(hash_int, direction, bitDepth) {
        bitDepth = bitDepth || 52;
        var lonlat = decode_int(hash_int, bitDepth);
        var neighbor_lat = lonlat.latitude + direction[0] * lonlat.error.latitude * 2;
        var neighbor_lon = lonlat.longitude + direction[1] * lonlat.error.longitude * 2;
        return encode_int(neighbor_lat, neighbor_lon, bitDepth);
      };

      neighbors = function neighbors(hash_string) {

        var hashstringLength = hash_string.length;

        var lonlat = decode(hash_string);
        var lat = lonlat.latitude;
        var lon = lonlat.longitude;
        var latErr = lonlat.error.latitude * 2;
        var lonErr = lonlat.error.longitude * 2;

        var neighbor_lat, neighbor_lon;

        var neighborHashList = [encodeNeighbor(1, 0), encodeNeighbor(1, 1), encodeNeighbor(0, 1), encodeNeighbor(-1, 1), encodeNeighbor(-1, 0), encodeNeighbor(-1, -1), encodeNeighbor(0, -1), encodeNeighbor(1, -1)];

        function encodeNeighbor(neighborLatDir, neighborLonDir) {
          neighbor_lat = lat + neighborLatDir * latErr;
          neighbor_lon = lon + neighborLonDir * lonErr;
          return encode(neighbor_lat, neighbor_lon, hashstringLength);
        }

        return neighborHashList;
      };

      neighbors_int = function neighbors_int(hash_int, bitDepth) {

        bitDepth = bitDepth || 52;

        var lonlat = decode_int(hash_int, bitDepth);
        var lat = lonlat.latitude;
        var lon = lonlat.longitude;
        var latErr = lonlat.error.latitude * 2;
        var lonErr = lonlat.error.longitude * 2;

        var neighbor_lat, neighbor_lon;

        var neighborHashIntList = [encodeNeighbor_int(1, 0), encodeNeighbor_int(1, 1), encodeNeighbor_int(0, 1), encodeNeighbor_int(-1, 1), encodeNeighbor_int(-1, 0), encodeNeighbor_int(-1, -1), encodeNeighbor_int(0, -1), encodeNeighbor_int(1, -1)];

        function encodeNeighbor_int(neighborLatDir, neighborLonDir) {
          neighbor_lat = lat + neighborLatDir * latErr;
          neighbor_lon = lon + neighborLonDir * lonErr;
          return encode_int(neighbor_lat, neighbor_lon, bitDepth);
        }

        return neighborHashIntList;
      };

      bboxes = function bboxes(minLat, minLon, maxLat, maxLon, numberOfChars) {
        numberOfChars = numberOfChars || 9;

        var hashSouthWest = encode(minLat, minLon, numberOfChars);
        var hashNorthEast = encode(maxLat, maxLon, numberOfChars);

        var latLon = decode(hashSouthWest);

        var perLat = latLon.error.latitude * 2;
        var perLon = latLon.error.longitude * 2;

        var boxSouthWest = decode_bbox(hashSouthWest);
        var boxNorthEast = decode_bbox(hashNorthEast);

        var latStep = Math.round((boxNorthEast[0] - boxSouthWest[0]) / perLat);
        var lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1]) / perLon);

        var hashList = [];

        for (var lat = 0; lat <= latStep; lat++) {
          for (var lon = 0; lon <= lonStep; lon++) {
            hashList.push(neighbor(hashSouthWest, [lat, lon]));
          }
        }

        return hashList;
      };

      bboxes_int = function bboxes_int(minLat, minLon, maxLat, maxLon, bitDepth) {
        bitDepth = bitDepth || 52;

        var hashSouthWest = encode_int(minLat, minLon, bitDepth);
        var hashNorthEast = encode_int(maxLat, maxLon, bitDepth);

        var latlon = decode_int(hashSouthWest, bitDepth);

        var perLat = latlon.error.latitude * 2;
        var perLon = latlon.error.longitude * 2;

        var boxSouthWest = decode_bbox_int(hashSouthWest, bitDepth);
        var boxNorthEast = decode_bbox_int(hashNorthEast, bitDepth);

        var latStep = Math.round((boxNorthEast[0] - boxSouthWest[0]) / perLat);
        var lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1]) / perLon);

        var hashList = [];

        for (var lat = 0; lat <= latStep; lat++) {
          for (var lon = 0; lon <= lonStep; lon++) {
            hashList.push(neighbor_int(hashSouthWest, [lat, lon], bitDepth));
          }
        }

        return hashList;
      };

      _export('default', {
        'ENCODE_AUTO': ENCODE_AUTO,
        'encode': encode,
        'encode_uint64': encode_int, // keeping for backwards compatibility, will deprecate
        'encode_int': encode_int,
        'decode': decode,
        'decode_int': decode_int,
        'decode_uint64': decode_int, // keeping for backwards compatibility, will deprecate
        'decode_bbox': decode_bbox,
        'decode_bbox_uint64': decode_bbox_int, // keeping for backwards compatibility, will deprecate
        'decode_bbox_int': decode_bbox_int,
        'neighbor': neighbor,
        'neighbor_int': neighbor_int,
        'neighbors': neighbors,
        'neighbors_int': neighbors_int,
        'bboxes': bboxes,
        'bboxes_int': bboxes_int
      });
    }
  };
});
//# sourceMappingURL=geohash.js.map
