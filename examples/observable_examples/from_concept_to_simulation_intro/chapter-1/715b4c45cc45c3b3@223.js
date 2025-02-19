// https://observablehq.com/@gampleman/table@223
function _1(md){return(
md`# Table

This is an extension of [Fancy Tables](https://beta.observablehq.com/@tmcw/fancy-tables) by @tmcw.

The main advantage here is that:

1. This can be used without creating a cell. Simply by passing in data and then creating a variable with \`viewof\` one can get both a nice view of the data and the data as a variable.
2. Because of this, if the data is a promise (i.e. a fetch), a loading animation will be rendered. Support for streaming data may come in the future.
3. The data can be sorted by clicking the table headers.
4. The styling is designed for overflow scrolling.

## Usage

First import this into your notebook:

~~~javascript
import { table } from "@gampleman/table"
~~~

The simplest usage is to simply pass in an array of objects:
`
)}

function _2(table){return(
table([
  {first_name: 'John', last_name: 'Doe'},
  {first_name: 'Martin', last_name: 'Smith'}
])
)}

function _3(md){return(
md`You can also pass in something that produces a promise:`
)}

function _4(table,json_url){return(
table(
  fetch(json_url).then(d => d.json())
)
)}

function _5(md){return(
md`If you use \`viewof\`, you can also assign the data produced by the first argument in the same cell:`
)}

function _data(table,json_url){return(
table(
  fetch(json_url).then(d => d.json())
)
)}

function _7(data){return(
data
)}

function _8(md){return(
md`Finally, you can use the second argument to customize the output:`
)}

function _9(table,json_url){return(
table(
  fetch(json_url).then(d => d.json()),
  {
    nully: () => '<span style="color: red">No data</span>',
    limit: 500,
    enableFilter: false,
    enableCSVDownload: true,
    columns: [{ 
      key: 'key',
      name: 'Station ID',
      render: val => `<a href="https://google.com/?q=${val}" target="_blank">${val}</a>`
    }, 
    'last1hrf', 
    'rainfall',
    'rainfallmsg', 
    {
      key: 'rfstationstatus', 
      name: 'RF Status'
    }]
  }
)
)}

function _table(loader,defaultHumanize,html,parseQuery,DOM,CSV){return(
async function*(dataPromise, options = {}) {
  yield loader;

  const dataO = await Promise.resolve(dataPromise);

  let filter = () => true;

  const data = Array.isArray(dataO)
    ? dataO
    : Object.entries(dataO).map(([key, v]) => Object.assign({ key }, v));

  let {
    humanize,
    nully,
    limit,
    columns,
    enableFilter,
    enableCSVDownload,
    maxHeight
  } = Object.assign(
    {
      humanize: defaultHumanize,
      nully: () => '<span style="opacity: 0.5">-</span>',
      limit: 250,
      columns: Object.keys(data[0]),
      enableFilter: data.length > 50,
      enableCSVDownload: true,
      maxHeight: 400
    },
    options || {}
  );

  if (typeof maxHeight === 'number') maxHeight = `${maxHeight}px`;

  columns = columns.map(column => {
    let key;
    if (typeof column == 'string') {
      key = column;
      column = { key };
    } else {
      key = column.key;
    }

    const decimalNumber = data.reduce((memo, d) => {
      if (typeof d[key] === 'number') {
        let frac = (d[key] || '').toString().split('.')[1];
        if (frac) return Math.max(memo, frac.length);
      }
      return memo;
    }, 0);

    return Object.assign(
      {
        name: humanize(key),
        type: typeof data[0][key],
        accessor: row => row[key],
        render: val => {
          if (decimalNumber && typeof val === 'number') {
            return val.toFixed(decimalNumber);
          }
          if (val == null || val == undefined) {
            return nully(val);
          }
          return val;
        }
      },
      column
    );
  });
  const renderTable = () => {
    return `${data
      .filter(filter)
      .slice(0, limit)
      .map(
        datum =>
          `<tr>
           ${columns
             .map(c => {
               return `<td class=${c.type}>${c.render(c.accessor(datum))}</td>`;
             })
             .join('')}
         </tr>`
      )
      .join('')}`;
  };
  const output = html`<div>
<style>
table {
  min-width: 100%;
}
td { vertical-align: top; }
th:not(:first-child):not(:last-child), td:not(:first-child):not(:last-child) { padding: 0 10px; }
th { vertical-align: bottom; }
th 
.number {
  text-align: right;
  font-feature-settings: 'tnum';
}
tbody tr td.with-decimal {
  padding-left:10px !important;
  padding-right:0px !important;
}
tbody tr td.decimal {
  padding-left:0 !important;
  padding-right:10px !important;
}
details {
	position: absolute;
	bottom: 0;
	border-radius: 15px;
	background: white;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	width: 30px;
}
details[open] {
	width: 360px;
}
summary {
	list-style-type: none;
	display: inline-block;
	line-height: 28px;
	
	width: 30px;
	height: 30px;
	
	text-align: center;
}
details summary::-webkit-details-marker {
	display: none;
}
details input {
	position: absolute;
	top: 3px;
	left: 25px;
}
a[download] {
	position: absolute;
	bottom: 0;
	right: 5px;
	border-radius: 15px;
	background: white;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	width: 30px;
	height: 30px;
	text-align: center;
	line-height: 28px;
}
a[download] button {
	border: none;
	background: transparent;
}
</style>
<div>
<div style="max-height: ${maxHeight}; overflow: auto; position: relative;">
	
    <table>
      <thead>
        <tr>
          ${columns
            .map(
              c => `<th class="${c.type}" data-key="${c.key}">${c.name}</th>`
            )
            .join('')}
        </tr>
      </thead>
      <tbody>
      	${renderTable()}
      </tbody>
    </table>${
      data.filter(filter).length > limit
        ? `<p><em>This table has been truncated from ${data.length} rows to ${limit}</em></p>`
        : ''
    }
</div>
${
  enableFilter
    ? '<details><summary>🔎</summary><input type="search" placeholder="Type in a filter query" /></details>'
    : ''
}
</div>

    `;
  output.value = dataO;
  yield output;

  output.querySelectorAll('th').forEach(th =>
    th.addEventListener('click', () => {
      const key = th.dataset.key;
      const order = th.dataset.order === 'ascending' ? -1 : 1;
      data.sort((a, b) =>
        a[key] > b[key] ? order : b[key] > a[key] ? -order : 0
      );
      output.querySelector('tbody').innerHTML = renderTable();
      th.dataset.order = order === -1 ? 'descending' : 'ascending';
    })
  );
  if (enableFilter) {
    const search = output.querySelector('input[type=search]');
    search.addEventListener('input', e => {
      filter = parseQuery(search.value, columns);
      output.querySelector('tbody').innerHTML = renderTable();
    });
  }
  if (enableCSVDownload) {
    output.appendChild(
      DOM.download(
        new Blob(
          [
            CSV(data, {
              fields: columns.map(c => ({ label: c.name, value: c.key }))
            })
          ],
          { type: "application/json" }
        ),
        'data.csv',
        '⬇'
      )
    );
  }
}
)}

function _parseQuery(){return(
(q, headers) => {
  if (q == '') {
    return () => true;
  } else if (q.match(/[=<>]/)) {
      try {
        const code = headers.reduce((q, {key, name}) => q.replace(new RegExp(`\\b(${key}|${name})\\b`, 'g'), `data['${key}']`), q).replace(/([^=<>!])=([^=<>!]|$)/g, '$1===$2');
        return new Function('data', `try { return ${code} } catch(e) { return false; }` );
      } catch (e) {
          return () => true;
      }
  } else {
    const re = new RegExp(q, 'i');
  	return data => headers.some(({key}) => (data[key] || '').toString().match(re))
  }
}
)}

function _loader(html){return(
html`<style>
			.loader,
            .loader:before,
            .loader:after {
              background: #333333;
              -webkit-animation: load1 1s infinite ease-in-out;
              animation: load1 1s infinite ease-in-out;
              width: 1em;
              height: 2em;
            }
            .loader {
			  display: block;
              color: #333333;
              text-indent: -9999em;
              margin: 88px auto;
              position: relative;
              font-size: 11px;
              -webkit-transform: translateZ(0);
              -ms-transform: translateZ(0);
              transform: translateZ(0);
              -webkit-animation-delay: -0.16s;
              animation-delay: -0.16s;
            }
            .loader:before,
            .loader:after {
              position: absolute;
              top: 0;
              content: '';
            }
            .loader:before {
              left: -1.5em;
              -webkit-animation-delay: -0.32s;
              animation-delay: -0.32s;
            }
            .loader:after {
              left: 1.5em;
            }
            @-webkit-keyframes load1 {
              0%,
              80%,
              100% {
                box-shadow: 0 0;
                height: 2em;
              }
              40% {
                box-shadow: 0 -1em;
                height: 2.5em;
              }
            }
            @keyframes load1 {
              0%,
              80%,
              100% {
                box-shadow: 0 0;
                height: 2em;
              }
              40% {
                box-shadow: 0 -1em;
                height: 2.5em;
              }
            }
		</style>
		<span style="display: flex; justify-content: center; align-items: center; width: 100%; height: 200px"><i class="loader">Loading...</i></span>`
)}

function _defaultHumanize(){return(
str => str.replace(/[-_]/g, ' ')
)}

function _json_url(){return(
'https://gist.githubusercontent.com/gampleman/0903af7279c6c60e6d5c85ca33361960/raw/b21a86ceb808307208970b24045cfe9bc9a6f744/rainlevels.json'
)}

function _CSV(require){return(
require('json2csv@4.0.0').then(a => a.parse)
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["table"], _2);
  main.variable(observer()).define(["md"], _3);
  main.variable(observer()).define(["table","json_url"], _4);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer("viewof data")).define("viewof data", ["table","json_url"], _data);
  main.variable(observer("data")).define("data", ["Generators", "viewof data"], (G, _) => G.input(_));
  main.variable(observer()).define(["data"], _7);
  main.variable(observer()).define(["md"], _8);
  main.variable(observer()).define(["table","json_url"], _9);
  main.variable(observer("table")).define("table", ["loader","defaultHumanize","html","parseQuery","DOM","CSV"], _table);
  main.variable(observer("parseQuery")).define("parseQuery", _parseQuery);
  main.variable(observer("loader")).define("loader", ["html"], _loader);
  main.variable(observer("defaultHumanize")).define("defaultHumanize", _defaultHumanize);
  main.variable(observer("json_url")).define("json_url", _json_url);
  main.variable(observer("CSV")).define("CSV", ["require"], _CSV);
  return main;
}
