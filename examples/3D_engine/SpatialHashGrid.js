/* ***************************************************************************************/
/*   Title: Sketchbook - Control Box
*    Author: @simondevyoutube
*    Date: 2020
*    License: MIT
*    Code version: 
*    Availability: https://github.com/simondevyoutube/Tutorial_SpatialHashGrid
*
****************************************************************************************/
// adapted from https://www.youtube.com/watch?v=sx4IIQL0x7c&t=593s

// bounds: Total Spacing [[xmin, ymin], [xmax, ymax]]
// dimensions: Number of divizion in width and height [Nwidth, Nheight]

class SpatialHashGrid {
  constructor(bounds, dimensions) {
    this._bounds = bounds;
    this._dimensions = dimensions;
    this._cells = new Map();
  }

  NewClient(position, dimensions, name){
    const N = name || null

    const client = {
      position: position,
      dimensions: dimensions,
      name: N,
    }

    this._Insert(client);

    return client;
  }

  _Insert (client) {
    const {x: x, y: y} = client.position;
    const {w: w, h: h} = client.dimensions;

    const i1 = this._GetCellIndex([x-w/2, y-h/2]);
    const i2 = this._GetCellIndex([x+w/2, y+h/2]);

    client.indices = [i1, i2];

    for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
      for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
        const k = this._Key(x, y);

        if(!(k in this._cells)) {
          this._cells[k] = new Set();
        }

        this._cells[k].add(client);
      }
    }
  }

  _Key (x, y) {
    return x + '.' + y;
  }

  _GetCellIndex(position) {
    const x = this.Sat((position[0]- this._bounds[0][0]) /
              (this._bounds[1][0] - this._bounds[0][0]));

    const y = this.Sat((position[1]- this._bounds[0][1]) /
              (this._bounds[1][1] - this._bounds[0][1]));
  
    const xIndex = Math.floor(x * (this._dimensions[0] - 1))
    const yIndex = Math.floor(y * (this._dimensions[1] - 1))
    
    return [xIndex, yIndex];
  }

  FindNearby(position, bounds) {
    const {x, y} = position;
    const {w, h} = bounds;

    const i1 = this._GetCellIndex([x-w/2, y-h/2]);
    const i2 = this._GetCellIndex([x+w/2, y+h/2]);

    // client.indices = [i1, i2];
    const clients = new Set();

    for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
      for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
        const k = this._Key(x, y);

        if(k in this._cells) {
          for (let v of this._cells[k]) {
            clients.add(v);
          }
        }
      }
    }
    return clients;
  }


  UpdateClient (client) {
    this.RemoveClient(client);
    this._Insert(client);
  }

  RemoveClient (client) {
    const [i1, i2] = client.indices;

    client.indices = [i1, i2];

    for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
      for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
          const k = this._Key(x, y);

          this._cells[k].delete(client);
      }
    }
  }

  // This function taken from the math.js in original version @ferrari212
  Sat (x) {
    return Math.min(Math.max(x, 0.0), 1.0);
  }
} 