class CheckPoint {
  // constructor({name, position , radius = 10, bounds = {x: {max: 450, min: -450}, y: {max: 450, min: -450}}}) {
  constructor(obj) {
    
    this.name = obj.name;
    const POS = obj.position;
    const BOUNDS = obj.bounds || {x: {max: 450, min: -450}, y: {max: 450, min: -450}}
    this.position = POS || {x: this.randomLocation(BOUNDS.x.max, BOUNDS.x.min), y: this.randomLocation(BOUNDS.y.max, BOUNDS.y.min)} ;
    this.radius = obj.radius || 10
    this.color = obj.color || "#ffff00"
    this.tranStatus = 1

    this.addMesh();
    this.addLight();
    this.update = this.normalChange;
    
  }

  addMesh() {
    this.geometry = new THREE.OctahedronGeometry(this.radius);
    this.material = new THREE.MeshBasicMaterial( {
                          color: this.color,
                          transparent: true,
                          opacity: 0.9,
                          wireframe: true,
                        } );
    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.mesh.position.set(this.position.x, this.position.y, 10);
  }

  addLight() {
    this.light = new THREE.PointLight( this.color, 2, 100 );
    this.light.castShadow = true;
    // The distance are inverted due Vessel.js rotation @ferrari212
    this.light.position.set( this.position.x, this.position.y, 10 );
  }

  randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  randomLocation(min, max) {
    return Math.sign(Math.random()-.5) * this.randomIntFromRange(min, max);
  }

  // update() {  }

  normalChange() {
    this.mesh.rotation.z += .01;
  }

  transientChange() {
    if(this.tranStatus > 0) {
      this.tranStatus -= 0.01;

      const x = this.tranStatus;
      const ROT = - x*x + x + 0.01;

      this.material.color.setRGB(1,x,0);
      this.mesh.rotation.z += ROT;
      this.light.color.setRGB(1,x,0);
      
      return x
    }

    this.update = this.normalChange;
    return this.tranStatus
  }
}
