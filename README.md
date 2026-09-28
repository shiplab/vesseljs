# Vessel.js

[![NPM Package][npm]][npm-url]
[![Contributors][contributors]][contributors-url]
![Vessel.js CI](https://github.com/shiplab/vesseljs/actions/workflows/ci.yml/badge.svg)

> ⚠️ **Legacy project.** Vessel.js is no longer actively maintained. The code, examples and [website](https://shiplab.github.io/vesseljs/) are kept online as a reference for research and teaching. Some examples may not work in current browsers.

**Vessel.js** is an open-source JavaScript library for conceptual ship design with an object-oriented approach. The vessel is represented as an object with properties and methods, which are used to run analyses and simulations directly in the web browser: hydrostatics, stability, ship motions, marine operations, manoeuvring, and fuel and energy.

The library was developed from 2017 to 2025 at the **Ship Design and Operation Lab**, Norwegian University of Science and Technology (NTNU), Ålesund.

- Website and examples gallery: <https://shiplab.github.io/vesseljs/>
- Examples index: [examples/README.md](examples/README.md)
- Wiki: <https://github.com/shiplab/vesseljs/wiki>
- npm: [`@shiplab/vessels`](https://www.npmjs.com/package/@shiplab/vessels)

## How to cite

Vessel.js was introduced and explained in the IMDC 2018 paper. Its later development was documented at IMDC 2022. If you use the library, the examples or the ideas behind them, please cite:

1. **Gaspar, H. M. (2018).** Vessel.js: An open and collaborative ship design object-oriented library. In *Marine Design XIII – Proceedings of the 13th International Marine Design Conference (IMDC 2018)*, Helsinki, Finland. CRC Press. <https://doi.org/10.1201/9780429440533-10>
2. **Gaspar, H. M. (2022).** Current State of the Vessel.js Library: A Web-Based Toolbox for Maritime Simulations. *14th International Marine Design Conference (IMDC 2022)*, Vancouver, Canada. SNAME. <https://doi.org/10.5957/IMDC-2022-271>

<details>
<summary>BibTeX</summary>

```bibtex
@inproceedings{gaspar2018vesseljs,
  author    = {Gaspar, Henrique Murilo},
  title     = {Vessel.js: An open and collaborative ship design object-oriented library},
  booktitle = {Marine Design XIII: Proceedings of the 13th International Marine Design Conference (IMDC 2018)},
  address   = {Helsinki, Finland},
  publisher = {CRC Press},
  year      = {2018},
  doi       = {10.1201/9780429440533-10}
}

@inproceedings{gaspar2022vesseljs,
  author    = {Gaspar, Henrique Murilo},
  title     = {Current State of the Vessel.js Library: A Web-Based Toolbox for Maritime Simulations},
  booktitle = {14th International Marine Design Conference (IMDC 2022)},
  address   = {Vancouver, Canada},
  publisher = {Society of Naval Architects and Marine Engineers (SNAME)},
  year      = {2022},
  doi       = {10.5957/IMDC-2022-271}
}
```

</details>

The same information is in [`CITATION.cff`](CITATION.cff), which GitHub shows as **"Cite this repository"**.

## Authors

Vessel.js was conceived and led by **Henrique Murilo Gaspar**. It was developed with **Ícaro Aragão Fonseca**, **Felipe Ferrari de Oliveira**, **Elias Hasle**, **Diogo Kramel**, **Vicente Alejandro Iváñez Encinas**, **Mateus Sant'Ana** and **Sergi Escamilla**, together with students and colleagues at NTNU. See [AUTHORS.md](AUTHORS.md) for who did what.

## Repository map

| Path | Contents |
|---|---|
| `source/jsm/` | Current library source as ES modules (entry point: `source/jsm/vessel.js`) |
| `source/classes/`, `source/math/`, `source/fileIO/` | Original (pre-module) source, kept for reference |
| `build/` | Built bundles: `vessel.js` (classic script, used by most examples), `vessel.module.js`, `vessel.module.min.js`, `vessel.zip` |
| `vessel.js`, `vessel.module*.js` (root) | Copies of the built bundles, kept so existing external links keep working |
| `examples/` | Example applications, ship specifications, 3D models and supporting code (see [index](examples/README.md)) |
| `manual/` | Step-by-step tutorials |
| `tests/` | Jest unit tests (`tests/unity_tests`) and manual test pages |
| `utils/build/` | Rollup build configuration |
| `index.html`, `images/` | Project website (GitHub Pages) |

## Using the library

In the browser, as an ES module:

```js
import * as Vessel from "https://shiplab.github.io/vesseljs/build/vessel.module.js";
```

Or as a classic script, which the older examples use:

```html
<script src="https://shiplab.github.io/vesseljs/build/vessel.js"></script>
```

Building and testing (Node.js 20):

```bash
npm install
npm run build   # rollup → build/vessel.module.js, build/vessel.module.min.js, build/vessel.zip
npm test        # jest
```

## Contributing

The project is not under active development. Issues and pull requests are welcome, but they may not be reviewed quickly. For your own development, fork the repository.

## License

Vessel.js is released under the [MIT License](LICENSE.md). Bundled third-party code keeps its own license. See [THIRD_PARTY.md](THIRD_PARTY.md).

[npm]: https://img.shields.io/npm/v/@shiplab/vessels
[npm-url]: https://www.npmjs.com/package/@shiplab/vessels
[contributors]: https://img.shields.io/github/contributors/shiplab/vesseljs
[contributors-url]: https://github.com/shiplab/vesseljs/graphs/contributors
