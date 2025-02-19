function _1(md){return(
md`# Vega-Lite API v4`
)}

function _2(md){return(
md`The [Vega-Lite JavaScript API](https://github.com/vega/vega-lite-api/) provides a convenient way to write [Vega-Lite](https://vega.github.io/vega-lite) specifications in a programmatic fashion. Scroll down for some usage examples, or browse the [Vega-Lite API example collection](https://observablehq.com/collection/@vega/vega-lite-api)!

This notebook uses **version 4** of Vega-Lite and the corresponding Vega-Lite API 4.0. _To use the more recent Vega-Lite version 5, see the [Vega-Lite API v5 notebook](https://observablehq.com/@vega/vega-lite-api-v5) instead._

Want to learn more about data visualization and how to use the Vega-Lite API? Read the [introduction to Vega-Lite](https://observablehq.com/@uwdata/introduction-to-vega-lite) and the [data visualization curriculum](https://observablehq.com/@uwdata/data-visualization-curriculum?collection=@uwdata/visualization-curriculum).`
)}

function _3(md){return(
md`
The cell below imports the Vega-Lite API and registers the desired versions of Vega and Vega-Lite, along with default [Vega View options](https://vega.github.io/vega/docs/api/view/#view) and [Vega-Lite configuration](https://vega.github.io/vega-lite/docs/config.html):
`
)}

async function _vl(require)
{
  const [vega, vegalite, api, tooltip] = await Promise.all([
    'vega@5.23.0',
    'vega-lite@4.17.0',
    'vega-lite-api@4.0.0',
    'vega-tooltip@0.25.1'
  ].map(module => require(module)));

  const options = {
    config: {
      // vega-lite default configuration
      config: {
        view: {continuousWidth: 400, continuousHeight: 300},
        mark: {tooltip: null}
      }
    },
    init: view => {
      // initialize tooltip handler
      view.tooltip(new tooltip.Handler().call);
      // enable horizontal scrolling for large plots
      if (view.container()) view.container().style['overflow-x'] = 'auto';
    },
    view: {
      // view constructor options
      loader: vega.loader({baseURL: 'https://cdn.jsdelivr.net/npm/vega-datasets@2/'}),
      renderer: 'canvas'
    }
  };
  
  return api.register(vega, vegalite, options);
}


function _5(md){return(
md`To use the same setup in your own notebooks, add a cell with the following code:
~~~ js
import {vl} from '@vega/vega-lite-api'
~~~
To use the API outside of Observable, see the [stand-alone usage instructions](#standalone_use) below.
`
)}

function _zip_codes(md){return(
md`## Zip Codes

A dot for each zip code in the United States, colored by the first digit.
`
)}

function _7(vl,width){return(
vl.markSquare({size: 2, opacity: 1})
  .data('data/zipcodes.csv')
  .transform(vl.calculate('substring(datum.zip_code, 0, 1)').as('digit'))
  .project(
    vl.projection('albersUsa')
  )
  .encode(
    vl.longitude().fieldQ('longitude'),
    vl.latitude().fieldQ('latitude'),
    vl.color().fieldN('digit')
  )
  .width(width)
  .height(Math.floor(width / 1.75))
  .autosize({type: 'fit-x', contains: 'padding'})
  .config({view: {stroke: null}})
  .render()
)}

function _interactive_weather(md){return(
md`## Interactive Seattle Weather 2012-2015

A scatter plot and summary histogram with linked \`selections\` between plots to perform cross-filtering and configure conditional color encodings.
`
)}

function _9(vl,width)
{
  const brush = vl.selectInterval().encodings('x');
  const click = vl.selectMulti().encodings('color');

  const scale = {
    domain: ['sun', 'fog', 'drizzle', 'rain', 'snow'],
    range: ['#e7ba52', '#a7a7a7', '#aec7e8', '#1f77b4', '#9467bd']
  };

  const plot1 = vl.markPoint({filled: true})
    .encode(
      vl.color().value('lightgray')
        .if(brush, vl.color().fieldN('weather').scale(scale).title('Weather')),
      vl.size().fieldQ('precipitation').scale({domain: [-1, 50], range: [10, 500]}).title('Precipitation'),
      vl.order().fieldQ('precipitation').sort('descending'),
      vl.x().timeMD('date').axis({title: 'Date', format: '%b'}),
      vl.y().fieldQ('temp_max').scale({domain: [-5, 40]}).axis({title: 'Maximum Daily Temperature (°C)'})
    )
    .width(width)
    .height(300)
    .select(brush)
    .transform(vl.filter(click));

  const plot2 = vl.markBar()
    .encode(
      vl.color().value('lightgray')
        .if(click, vl.color().fieldN('weather').scale(scale).title('Weather')),
      vl.x().count(),
      vl.y().fieldN('weather').scale({domain: scale.domain}).title('Weather')
    )
    .width(width)
    .select(click)
    .transform(vl.filter(brush));

  return vl.vconcat(plot1, plot2)
    .data('data/seattle-weather.csv')
    .autosize({type: 'fit-x', contains: 'padding'})
    .render();
}


function _parallel_coordinats(md){return(
md`## Parallel Coordinates

A [parallel coordinates plot](https://en.wikipedia.org/wiki/Parallel_coordinates) that uses \`window\` and \`fold\` transforms to convert the four dimensions of penguin measurements into normalized coordinates that can be visualized as \`line\` marks. The graphic includes an additional layer with custom \`text\` mark labels for the parallel axis grid lines. We render the plot as SVG by passing \`{renderer:'svg'}\` to the \`render\` method.
`
)}

function _11(vl,width)
{
  const domain = [
    'Beak Length (mm)',
    'Beak Depth (mm)',
    'Flipper Length (mm)',
    'Body Mass (g)'
  ];

  const scale = {
    type: 'point',
    padding: 0
  };
  
  const axis = {
    domain: false,
    ticks: false,
    title: false,
    grid: true,
    gridColor: '#888',
    labelAngle: 0,
    labelPadding: 8,
    labelFontWeight: 'bold'
  };

  const lines = vl.markLine({
      strokeWidth: 1.5,
      opacity: 0.5
    })
    .encode(
      vl.color().fieldN('Species').sort('descending'),
      vl.detail().fieldN('index'),
      vl.x().fieldO('key').scale(scale).axis(axis),
      vl.y().fieldQ('fraction').axis(null)
    );

  const labels = vl.markText({
      dx: -2,
      align: 'right',
      baseline: 'middle'
    })
    .transform(
      vl.groupby('key').aggregate(vl.min('value').as('min'), vl.max('value').as('max')),
      vl.fold('min', 'max').as('op', 'value'),
      vl.groupby('key').window(vl.percent_rank('value').as('fraction'))
    )
    .encode(
      vl.x().fieldN('key'),
      vl.y().fieldQ('fraction').axis(null),
      vl.text().field('value').format(',')
    );

  const plot = vl.layer(lines, labels)
    .data('data/penguins.json')
    .transform(
      vl.filter('datum["Beak Length (mm)"] != null'),
      vl.window(vl.row_number().as('index')),
      vl.fold(domain).as('key', 'value'),
      vl.groupby('key').join(vl.min('value').as('min'), vl.max('value').as('max')),
      vl.calculate('(datum.value - datum.min) / (datum.max - datum.min)').as('fraction')
    )
    .width(width)
    .height(300)
    .autosize({type: 'fit-x', contains: 'padding'})

  return plot.render({renderer: 'svg'});
}


function _standalone_use(md){return(
md`<hr/>
## Stand-Alone Usage in a Web Browser

To use the Vega-Lite API in the browser outside of Observable, you need to include all the dependencies, set the default configuration, and then register the Vega libraries. Here is some starting code to build from:

~~~html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-lite@4"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-lite-api@4"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-tooltip"></script>
  </head>
  <body>
    <div id="view"></div>

    <script>
      // setup API options
      const options = {
        config: {
          // Vega-Lite default configuration
        },
        init: (view) => {
          // initialize tooltip handler
          view.tooltip(new vegaTooltip.Handler().call);
        },
        view: {
          // view constructor options
          // remove the loader if you don't want to default to vega-datasets!
          loader: vega.loader({
            baseURL: "https://cdn.jsdelivr.net/npm/vega-datasets@2/",
          }),
          renderer: "canvas",
        },
      };

      // register vega and vega-lite with the API
      vl.register(vega, vegaLite, options);

      // now you can use the API!
      vl.markBar({ tooltip: true })
        .data([
          { a: "A", b: 28 }, { a: "B", b: 55 }, { a: "C", b: 43 },
          { a: "D", b: 91 }, { a: "E", b: 81 }, { a: "F", b: 53 },
          { a: "G", b: 19 }, { a: "H", b: 87 }, { a: "I", b: 52 },
        ])
        .encode(
          vl.x().fieldQ("b"),
          vl.y().fieldN("a"),
          vl.tooltip([vl.fieldQ("b"), vl.fieldN("a")])
        )
        .render()
        .then(viewElement => {
          // render returns a promise to a DOM element containing the chart
          // viewElement.value contains the Vega View object instance
          document.getElementById('view').appendChild(viewElement);
        });
    </script>
  </body>
</html>

~~~`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer()).define(["md"], _3);
  main.variable(observer("vl")).define("vl", ["require"], _vl);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer("zip_codes")).define("zip_codes", ["md"], _zip_codes);
  main.variable(observer()).define(["vl","width"], _7);
  main.variable(observer("interactive_weather")).define("interactive_weather", ["md"], _interactive_weather);
  main.variable(observer()).define(["vl","width"], _9);
  main.variable(observer("parallel_coordinats")).define("parallel_coordinats", ["md"], _parallel_coordinats);
  main.variable(observer()).define(["vl","width"], _11);
  main.variable(observer("standalone_use")).define("standalone_use", ["md"], _standalone_use);
  return main;
}
