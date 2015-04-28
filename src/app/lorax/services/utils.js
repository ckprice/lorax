/**
 * Utility functions
 *
 * @class lorax/services/utilsService
 */
define(function () {
    'use strict';

    var utilsService = function () {

        /**
         * @method core/services/utilsService~getURLParameter
         * @param name {String} name of parameter
         */
        function getURLParameter(name) {
            return decodeURIComponent((
                new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [,''])[1]
                    .replace(/\+/g, '%20'
            )) || null;
        }

        /**
         * Adds the source link(s) to the infographic container.
         * @param {object} sourceData - The data for source
         * @param {object} container - The container to append the source link to.
         * @param {boolean} [absolute] - Whether to add position:absolute to ul
         */
         function addSource(sourceData, container, absolute) {
             var ul = $('<ul />', {
                 class: 'source'
             });

             if (absolute) {
                 ul.css('position', 'absolute');
             }

             var li = $('<li />');
             var span = $('<span />', {
                 text: sourceData.label
             });
             li.append(span);

             // not all sources are linked
             if (sourceData.src !== '') {
                 li.append($('<a />', {
                     href: sourceData.src,
                     text: sourceData.name
                 }));
             } else {
                 li.append(sourceData.name);
             }
             ul.append(li);
             container.append(ul);
         }

        /**
         * Takes a string such as internet_population, and returns it in
         * title case, such as: Internet Population
         * @param {string} sentence - The sentence to convert to title case
         * @param {string} delimiter - The delimiter between word in the above sentence.
         * return sentence in title case.
         */
         function titleCase(sentence, delimiter) {
            var words = sentence.split(delimiter);

            for (var i = 0, l = words.length; i < l; i++) {
                words[i] = words[i].replace(
                    words[i].substr(0,1),
                    words[i].substr(0,1).toUpperCase()
                );
            }

            return words.join(' ');
         }

         /**
          * Draws a legend based on the content of the chart
          * @param {object} config - Config object with parameters required to draw
          * the legend. Example:
          * {
          *   svg: svg,
          *   categories: categories,
          *   margin: margin,
          *   width: width,
          *   color: color
          * }
          */
         function drawLegend(config) {
             var legend = config.svg.selectAll('.legend')
                 .data(config.categories.slice().reverse())
               .enter().append('g')
                 .attr('class', 'legend')
                 .attr('transform', function(d, i) { return 'translate(' + config.margin.right + ',' + -((i + 1) * 20) + ')'; });

             legend.append('rect')
                 .attr('x', config.width - 18)
                 .attr('width', 18)
                 .attr('height', 18)
                 .style('fill', config.color);

             legend.append('text')
                 .attr('x', config.width - 24)
                 .attr('y', 9)
                 .attr('dy', '.35em')
                 .style('text-anchor', 'end')
                 .text(function(d) { return titleCase(d,'_'); });
         }

         /**
         * Draws the specified background grid lines based on the specified
         * config options.
         * @param {object} config - The config for the grid
         * {
         *   xGrid: xGrid, // optional boolean
         *   xAxis: xAxis, // optional, needs to be provided if xGrid is true
         *   yGrid: yGrid, // optional boolean
         *   yAxis: yAxis, // optional, needs to be provided if yGrid is true
         *   svg: svg, // the svg element to render the grid in
         *   height: innerHeight, // the height of the svg element
         *   width: innerWidth // the width of the svg element
         * }
         */
         function drawGrid(config) {
            if (config.xGrid) {
                config.svg.append('g')
                    .attr('class', 'grid')
                    .attr('transform', 'translate(0,' + config.height + ')')
                    .style('opacity', '0.1')
                    .call(config.xAxis.tickSize(-config.height, 0, 0)
                        .tickFormat(''));
            }

            if(config.yGrid) {
                config.svg.append('g')
                    .attr('class', 'grid')
                    .style('opacity', '0.1')
                    .call(config.yAxis.tickSize(-config.width, 0, 0)
                        .tickFormat(''));
            }
         }

         /**
          * Draws a simple bar chart with the values of each bar displayed inside
          * the individual bars. Bars are also grouped by topic, for example, by
          * language
          */
         function simpleGroupedBarChart() {

            var xGrid = true;
            var yGrid = true;

            var addLegend = true;
            // default colors used for the bars
            var colorArray = ['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00'];
            // determines the text offset of the first and second value labels from it's baseline
            var textOffsetRange = ['.05em', '.45em'];
            var fontColorArray;

            var margin = { top: 20, right: 20, bottom: 30, left: 40 };
            var width = 960 - margin.left - margin.right;
            var height = 500 - margin.top - margin.bottom;
            var barHeight = 10;

            /**
             * The main chart function.
             * @param {object} selection - A non SVG d3 selection of the element into
             * which this chart will be rendered.
             */
            function chart(selection) {

                var y0 = d3.scale.ordinal()
                    .rangeRoundBands([0, height], .5);

                var y1 = d3.scale.ordinal();

                var x = d3.scale.linear()
                    .range([0, width]);

                var color = d3.scale.ordinal()
                    .range(colorArray);

                var yAxisLabels = d3.svg.axis()
                    .scale(y0)
                    .orient('left');

                selection.each(function(data) {
                    var categories = d3.keys(data[0]).filter(function(key) { return key !== 'language'});

                    data.forEach(function(d) {
                        d.percentages = categories.map(function(name) { return {name: name, value: +d[name]}; });
                    });

                    y0.domain(data.map(function(d) { return d.language; }));
                    y1.domain(categories).rangeRoundBands([0, y0.rangeBand()]);
                    x.domain([0, d3.max(data, function(d) { return d3.max(d.percentages, function(d) { return d.value; }); })]);

                    var svg = d3.select(this).append('svg')
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                        .attr('class', 'simple-grouped')
                      .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    svg.append('g')
                        .attr('class', 'y axis')
                        .call(yAxisLabels);

                    var category = svg.selectAll('.category-items')
                        .data(data)
                      .enter().append('g')
                        .attr('class', 'g')
                        .attr('transform', function(d, i) {
                            return 'translate(0,' + y0(d.language) + ')';
                        });

                    category.selectAll('rect')
                        .data(function(d) { return d.percentages; })
                      .enter().append('rect')
                        .attr('width', function(d) { return x(d.value); })
                        .attr('height', barHeight - 1)
                        .attr('y', function(d) { return y1(d.name) })
                        .attr('fill', function(d) { return color(d.name); });

                    category.selectAll('text')
                        .data(function(d) { return d.percentages; })
                      .enter().append('text')
                        .attr('x', width + margin.right)
                        .attr('y', function(d) { return y1(d.name) + (barHeight / 2) })
                        .attr('dy', function(d, i) { return textOffsetRange[i % 2] })
                        .style('fill', function(d, i) { return fontColorArray ? fontColorArray[i % 2] : '#000' })
                        .text(function(d) {
                            // store the format so we can use it as a function.
                            var format  = d3.format('%');
                            return format(d.value);
                    });

                    if(yGrid) {
                        svg.append('g')
                            .attr('class', 'grid')
                            .style('opacity', '0.1')
                            .call(yAxisLabels.tickSize(-width, 0, 0)
                                .tickFormat(''));
                    }

                    if (addLegend) {
                        var config = {
                            svg: svg,
                            categories: categories,
                            margin: margin,
                            width: width,
                            color: color
                        };
                        drawLegend(config);
                    }
                });
            }

            /**
             * By default a legend will be drawn but, the user can
             * override this be calling addLegend and passing false
             */
            chart.addLegend = function(value) {
                if (!arguments.length) return addLegend
                addLegend = value;
                return chart;
            }

            /**
             * Allows a user to override the colors used for bars. This is
             * specified as an array of hex color values.
             */
            chart.colorArray = function(value) {
                if (!arguments.length) return colorArray;
                colorArray = value;
                return chart;
            }

            /**
             * Allows a user to override the colors used for text labels drawn inside the
             * bars. This is specified as an array of two hex color values.
             */
            chart.fontColorArray = function(value) {
                if (!arguments.length) return fontColorArray;
                fontColorArray = value;
                return chart;
            }

            /**
             * Allows a user to override the text offset range for the value labels to
             * the right of the y axis. This is specified as an array of two em values.
             */
            chart.textOffsetRange = function(value) {
                if (!arguments.length) return textOffsetRange;
                textOffsetRange = value;
                return chart;
            }

            /**
             * Returns the default margins or the margins specified
             * by the user. This is specified as an object of the form
             * { top: 20, right: 20, bottom: 30, left: 40 }
             */
            chart.margin = function(value) {
                if (!arguments.length) return margin;
                margin = value;
                return chart;
            }

            /**
             * Returns the default width or that specified by the user.
             * It is important to note that the width specified should be calculated
             * as follows before being passed:
             * width = fullWidth - margin.left - margin.right;
             */
            chart.width = function(value) {
                if (!arguments.length) return width;
                width = value;
                return chart;
            }

            /**
             * Returns the default height or that specified by the user.
             * It is important to note that the height specified should be calculated
             * as follows before being passed:
             * height = fullHeight - margin.top - margin.bottom;
             */
            chart.height = function(value) {
                if (!arguments.length) return height;
                height = value;
                return chart;
            }

            return chart;
        }

        /**
         * Based on Mike Bostock's grouped bar chart - http://bl.ocks.org/mbostock/3887051
         * This draws a grouped bar chart where data related to an item in a category are
         * grouped such as grouping the percentage of internet content and percentage of
         * internet users per language.
         */
        function groupedBarChart() {

            var yAxisFormat;
            var addLegend = true;
            var colorArray = ['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00'];

            var margin = { top: 20, right: 20, bottom: 30, left: 40 };
            var width = 960 - margin.left - margin.right;
            var height = 500 - margin.top - margin.bottom;

            /**
             * Draws a legend based on the content of the chart
             * @param {object} config - Config object with parameters required to draw
             * the legend. Example:
             * {
             *   svg: svg,
             *   categories: categories,
             *   width: width,
             *   color: color
             * }
             */
            function drawLegend(config) {
                var legend = config.svg.selectAll('.legend')
                    .data(config.categories.slice().reverse())
                  .enter().append('g')
                    .attr('class', 'legend')
                    .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

                legend.append('rect')
                    .attr('x', config.width - 18)
                    .attr('width', 18)
                    .attr('height', 18)
                    .style('fill', config.color);

                legend.append('text')
                    .attr('x', config.width - 24)
                    .attr('y', 9)
                    .attr('dy', '.35em')
                    .style('text-anchor', 'end')
                    .text(function(d) { return titleCase(d,'_'); });
            }

            /**
             * The main chart function.
             * @param {object} selection - A non SVG d3 selection of the element into
             * which this chart will be rendered.
             */
            function chart(selection) {

                var x0 = d3.scale.ordinal()
                    .rangeRoundBands([0, width], .1);

                var x1 = d3.scale.ordinal();

                var y = d3.scale.linear()
                    .range([height, 0]);

                var color = d3.scale.ordinal()
                    .range(colorArray);

                var xAxis = d3.svg.axis()
                    .scale(x0)
                    .orient('bottom');

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient('left');

                // if a tick format has been specified, apply it.
                if (yAxisFormat) {
                    yAxis.tickFormat(yAxisFormat);
                }

                selection.each(function(data) {
                    var categories = d3.keys(data[0]).filter(function(key) { return key !== 'language'});

                    data.forEach(function(d) {
                        d.percentages = categories.map(function(name) { return {name: name, value: +d[name]}; });
                    });

                    x0.domain(data.map(function(d) { return d.language; }));
                    x1.domain(categories).rangeRoundBands([0, x0.rangeBand()]);
                    y.domain([0, d3.max(data, function(d) { return d3.max(d.percentages, function(d) { return d.value; }); })]);

                    var svg = d3.select(this).append('svg')
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                      .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    svg.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + height + ')')
                        .call(xAxis);

                    d3.select('.x')
                        .selectAll('.tick text')
                        .attr('y', '5')
                        .attr('x', '-5')
                        .style('text-anchor', 'end');

                    svg.append('g')
                        .attr('class', 'y axis')
                        .call(yAxis);

                    var state = svg.selectAll('.category-items')
                        .data(data)
                      .enter().append('g')
                        .attr('class', 'g')
                        .attr('transform', function(d) { return 'translate(' + x0(d.language) + ',0)'; });

                    state.selectAll('rect')
                        .data(function(d) { return d.percentages; })
                      .enter().append('rect')
                        .attr('width', x1.rangeBand())
                        .attr('x', function(d) { return x1(d.name); })
                        .attr('y', function(d) { return y(d.value); })
                        .attr('height', function(d) { return height - y(d.value); })
                        .attr('fill', function(d) { return color(d.name); });

                    if (addLegend) {
                        var config = {
                            svg: svg,
                            categories: categories,
                            width: width,
                            color: color
                        };
                        drawLegend(config);
                    }
                });
            }

            /**
             * By default a legend will be drawn but, the user can
             * override this be calling addLegend and passing false
             */
            chart.addLegend = function(value) {
                if (!arguments.length) return addLegend
                addLegend = value;
                return chart;
            }

            /**
             * Allows a user to override the colors used for bars. This is
             * specified as an array of hex color values.
             */
            chart.colorArray = function(value) {
                if (!arguments.length) return colorArray;
                colorArray = value;
                return chart;
            }

            /**
             * Returns the default yAxisFormat or sets the user
             * specified formatter. The default is no formatter.
             */
            chart.yAxisFormat = function(value) {
                if (!arguments.length) return yAxisFormat;
                yAxisFormat = value;
                return chart;
            }

            /**
             * Returns the default margins or the margins specified
             * by the user. This is specified as an object of the form
             * { top: 20, right: 20, bottom: 30, left: 40 }
             */
            chart.margin = function(value) {
                if (!arguments.length) return margin;
                margin = value;
                return chart;
            }

            /**
             * Returns the default width or that specified by the user.
             * It is important to note that the width specified should be calculated
             * as follows before being passed:
             * width = fullWidth - margin.left - margin.right;
             */
            chart.width = function(value) {
                if (!arguments.length) return width;
                width = value;
                return chart;
            }

            /**
             * Returns the default height or that specified by the user.
             * It is important to note that the height specified should be calculated
             * as follows before being passed:
             * height = fullHeight - margin.top - margin.bottom;
             */
            chart.height = function(value) {
                if (!arguments.length) return height;
                height = value;
                return chart;
            }

            return chart;
        }

        /**
         * Based Mike Bostock's reusable chart code, this makes adding simple bar
         * chart anywhere in Lorax simple.
         */
        function columnChart() {

            var yAxisFormat;
            var xGrid = false;
            var yGrid = false;

            var margin = { top: 20, right: 30, bottom: 30, left: 40 };
            var width = 960;
            var height = 500;
            var barWidth = 10;

            function chart(selection) {

                var innerWidth = width - margin.left - margin.right;
                var innerHeight = height - margin.top - margin.bottom;

                var x = d3.scale.ordinal().rangePoints([0, innerWidth], 1.0);
                var y = d3.scale.linear().range([innerHeight, 0]);

                var xAxis = d3.svg.axis().scale(x).orient('bottom');
                var yAxis = d3.svg.axis().scale(y).orient('left');

                // if a format was specified, apply
                if (yAxisFormat) {
                    yAxis.tickFormat(yAxisFormat);
                }

                selection.each(function(data) {
                    x.domain(data.map(function(d) { return d[0] }));
                    y.domain([0, d3.max(data, function(d) { return d[1]; })]);

                    var svg = d3.select(this).append('svg')
                       .attr('width', width)
                       .attr('height', height)
                       .attr('class', 'column-chart')
                     .append('g')
                       .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    var _x = svg.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + innerHeight + ')')
                        .call(xAxis);

                    _x.selectAll('text')
                        .attr('x', -barWidth)
                        .attr('y', barWidth)
                        .attr('dy', '.35em')
                        .style('text-anchor', 'end');

                    drawGrid({
                        xGrid: xGrid,
                        xAxis: xAxis,
                        yGrid: yGrid,
                        yAxis: yAxis,
                        svg: svg,
                        height: innerHeight,
                        width: innerWidth
                    });

                    svg.append('g')
                        .attr('class', 'y axis')
                        .call(yAxis);

                    svg.selectAll('.bar')
                        .data(data)
                      .enter().append('rect')
                        .attr('class', 'bar')
                        .attr('x', function(d) { return x(d[0]); })
                        .attr('y', function(d) { return y(d[1]); })
                        .attr('height', function(d) { return innerHeight - y(d[1]); })
                        .attr('width', barWidth);
                });
            }

            chart.yAxisFormat = function(value) {
                if (!arguments.length) return yAxisFormat;
                yAxisFormat = value;
                return chart;
            }

            chart.yGrid = function(value) {
                if (!arguments.length) return yGrid;
                yGrid = value;
                return chart;
            }

            chart.xGrid = function(value) {
                if (!arguments.length) return xGrid;
                xGrid = value;
                return chart;
            }

            chart.margin = function(value) {
                if (!arguments.length) return margin;
                margin = value;
                return chart;
            }

            chart.width = function(value) {
                if (!arguments.length) return width;
                width = value;
                return chart;
            }

            chart.height = function(value) {
                if (!arguments.length) return height;
                height = value;
                return chart;
            }

            return chart;
        }

        return {
            addSource: addSource,
            simpleGroupedBarChart: simpleGroupedBarChart,
            columnChart: columnChart,
            groupedBarChart: groupedBarChart,
            getURLParameter: getURLParameter
        };
    };

    return utilsService;
});
