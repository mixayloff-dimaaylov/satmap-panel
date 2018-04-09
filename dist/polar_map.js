'use strict';

System.register(['./circulus', 'lodash'], function (_export, _context) {
    "use strict";

    var circulus, _, _createClass, PolarMap;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [function (_circulus) {
            circulus = _circulus.default;
        }, function (_lodash) {
            _ = _lodash.default;
        }],
        execute: function () {
            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            PolarMap = function () {
                function PolarMap(canvas, options) {
                    _classCallCheck(this, PolarMap);

                    var size = Math.min(canvas.width, canvas.height);
                    canvas.width = canvas.height = size;

                    this.canvas = canvas;
                    this.options = options;
                    this.maxDistance = 0;
                    this.drawWidth = this.canvas.width - 60;
                    this.polar = circulus(canvas, true);
                    this.context = this.polar.context;
                }

                _createClass(PolarMap, [{
                    key: 'degToRad',
                    value: function degToRad(deg) {
                        return deg * (Math.PI / 180);
                    }
                }, {
                    key: 'radToDeg',
                    value: function radToDeg(rad) {
                        return rad * (180 / Math.PI);
                    }
                }, {
                    key: 'getPosition',
                    value: function getPosition(point) {
                        var φ1 = this.degToRad(this.options.center.lat);
                        var φ2 = this.degToRad(point.lat);

                        var λ1 = this.degToRad(this.options.center.lng);
                        var λ2 = this.degToRad(point.lng);

                        var Δλ = λ2 - λ1,
                            R = 6371e3; // gives d in metres
                        var distance = Math.acos(Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)) * R;

                        var y = Math.sin(Δλ) * Math.cos(φ2);
                        var x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
                        var bearing = Math.atan2(y, x);

                        point.bearing = bearing;
                        point.distance = distance;

                        return point;
                    }
                }, {
                    key: 'ccw90',
                    value: function ccw90(angle) {
                        return angle - Math.PI / 2;
                    }
                }, {
                    key: 'dToPx',
                    value: function dToPx(d) {
                        return d * this.drawWidth / 2 / this.maxDistance;
                    }
                }, {
                    key: 'invertColor',
                    value: function invertColor(hex, bw) {
                        if (hex.indexOf('#') === 0) {
                            hex = hex.slice(1);
                        }

                        if (hex.length === 3) {
                            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
                        }

                        if (hex.length !== 6) {
                            throw new Error('Invalid HEX color.');
                        }

                        var r = parseInt(hex.slice(0, 2), 16),
                            g = parseInt(hex.slice(2, 4), 16),
                            b = parseInt(hex.slice(4, 6), 16);
                        if (bw) {
                            return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
                        }

                        r = (255 - r).toString(16);
                        g = (255 - g).toString(16);
                        b = (255 - b).toString(16);

                        return "#" + padZero(r) + padZero(g) + padZero(b);
                    }
                }, {
                    key: 'drawGrid',
                    value: function drawGrid() {
                        this.context.fillStyle = "#444";
                        this.context.strokeStyle = "#444";

                        for (var i = 0; i < 360; i += 30) {
                            var angle = this.ccw90(this.degToRad(i));

                            this.polar.beginPath();
                            this.polar.moveTo(0, 0);
                            this.polar.lineTo(angle, this.drawWidth / 2);
                            this.polar.stroke();

                            this.polar.fillTextCentered(i + "°", angle, this.drawWidth / 2 + 10, 5);
                        }

                        this.polar.beginPath();
                        this.polar.arc(0, 0, this.drawWidth / 4, 0, Math.PI * 2); // 1/2 of grid
                        this.polar.arc(0, 0, this.drawWidth / 2, 0, Math.PI * 2); // 1 of grid
                        this.polar.stroke();

                        this.polar.fillTextCentered(Math.round(this.maxDistance / 2000) + " км", Math.PI, this.dToPx(this.maxDistance / 2), 10);
                        this.polar.fillTextCentered(Math.round(this.maxDistance / 2000) + " км", 0, this.dToPx(this.maxDistance / 2), 10);
                    }
                }, {
                    key: 'getColor',
                    value: function getColor(value) {
                        var thresholds = this.options.thresholds,
                            colors = this.options.colors;

                        if (!_.isFinite(value)) {
                            return colors[0];
                        }

                        for (var i = 0; i < thresholds.length; i++) {
                            if (value < thresholds[i]) {
                                return colors[i];
                            }
                        }

                        return colors[thresholds.length];
                    }
                }, {
                    key: 'drawTrackEnd',
                    value: function drawTrackEnd(point, system, prn, color, small) {
                        var size = small ? 10 : this.options.drawLabels ? 16 : 14;
                        this.context.fillStyle = color;

                        if (system === 'GLONASS') {
                            this.polar.fillRectCentered(point.a, point.r, size, size);
                        } else {
                            this.polar.beginPath();
                            this.polar.arc(point.a, point.r, size / 2, 0, Math.PI * 2);
                            this.polar.fill();
                        }

                        if (this.options.drawLabels && !small) {
                            this.context.fillStyle = this.invertColor(color, true);
                            this.polar.fillTextCentered(prn, point.a, point.r, 3);
                        }
                    }
                }, {
                    key: 'drawTrack',
                    value: function drawTrack(track) {
                        var _this = this;

                        if (track.data.length < 1) return;

                        this.context.strokeStyle = track.color;

                        _.forEach(track.data, function (point) {
                            point.a = _this.ccw90(point.bearing);
                            point.r = _this.dToPx(point.distance);
                        });

                        var system = track.sat.match(/([A-Z]+)/)[1] || '';
                        var prn = track.sat.match(/(\d+)/)[1] || '';

                        var head = _.head(track.data),
                            tail = _.last(track.data),
                            prev = head;

                        if (track.data.length > 1 && this.options.drawTracks) {
                            this.polar.beginPath();
                            this.polar.moveTo(head.a, head.r);

                            if (this.options.colorizeTracks) {
                                for (var i = 1; i < track.data.length; i++) {
                                    this.context.strokeStyle = this.getColor(track.data[i].value);

                                    if (track.data[i].timestamp - prev.timestamp < track.timeStep * 20) {
                                        this.polar.lineTo(track.data[i].a, track.data[i].r);
                                        this.polar.stroke();
                                    } else {
                                        this.drawTrackEnd(prev, system, prn, track.color, true);
                                    }

                                    prev = track.data[i];
                                    this.polar.beginPath();
                                    this.polar.moveTo(track.data[i].a, track.data[i].r);
                                }
                            } else {
                                for (var i = 1; i < track.data.length; i++) {
                                    if (track.data[i].timestamp - prev.timestamp < track.timeStep * 20) {
                                        this.polar.lineTo(track.data[i].a, track.data[i].r);
                                    } else {
                                        this.polar.stroke();
                                        this.drawTrackEnd(prev, system, prn, track.color, true);
                                        this.polar.beginPath();
                                        this.polar.moveTo(track.data[i].a, track.data[i].r);
                                    }

                                    prev = track.data[i];
                                }

                                this.polar.stroke();
                            }
                        }

                        this.drawTrackEnd(tail, system, prn, track.color);
                    }
                }, {
                    key: 'draw',
                    value: function draw(tracks) {
                        var _this2 = this;

                        _.forEach(tracks, function (track) {
                            return track.data = track.data.map(function (p) {
                                return _this2.getPosition(p);
                            });
                        });

                        this.maxDistance = _.chain(tracks).flatMap('data').filter(function (p) {
                            return p.distance < 7e6;
                        }).orderBy('distance', 'desc').head().get('distance').value() || 100e3;

                        this.maxDistance += this.maxDistance * 0.1; // Добавить 10% для отступа
                        this.polar.clearCanvas();

                        this.context.lineWidth = 1;
                        this.drawGrid();

                        this.context.lineWidth = 3;
                        tracks.forEach(function (track) {
                            return _this2.drawTrack(track);
                        });
                    }
                }]);

                return PolarMap;
            }();

            _export('default', PolarMap);
        }
    };
});
//# sourceMappingURL=polar_map.js.map
