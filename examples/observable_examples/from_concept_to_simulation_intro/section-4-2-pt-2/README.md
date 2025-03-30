# Section 4.2 Advance Resistance Analysis - Pt.2: Resistance Model

../section-4-2-pt-2/index.html@193

View this notebook in your browser by running a web server in this folder. For
example:

```sh
npx http-server
```

Or, use the [Observable Runtime](https://github.com/observablehq/runtime) to
import this module directly into your application. To npm install:

```sh
npm install @observablehq/runtime@5
npm install https://api.observablehq.com/d/327a73d5a73f182e@193.tgz?v=3
```

Then, import your notebook and the runtime as:

```js
import { Runtime, Inspector } from "@observablehq/runtime";
import define from "@ferrari212/section-4-2-advance-resistance-analysis-pt-2-resistance-mod";
```

To log the value of the cell named “foo”:

```js
const runtime = new Runtime();
const main = runtime.module(define);
main.value("foo").then((value) => console.log(value));
```
