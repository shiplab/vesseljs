function ObjectMenu(params) {
	this.ship3D = params.ship3D;
	this.ship = params.ship;
	this.shipState = params.shipState || params.ship.designState;
	
	if (params.parentGUI) {
		this.menu = params.parentGUI.addFolder("Object");
		this.menu.open();
	} else {
		this.menu = new dat.GUI();
		this.menu.open();
	}
		
	this.currentObject = new Vessel.DerivedObject({
		id: "",
		baseObject: null,
		group: "",
		referenceState: {},
		style: {},
	}); //dummy object
	
	let scope = this;
	
	this.proxy = new Proxy({}, {
		get: function(obj,prop) {
			/*let val = scope.currentObject[prop];
			if (typeof val === "object")*/
			return scope.currentObject[prop];
		},
		set: function(obj, prop, value) {
			scope.currentObject[prop] = value;
			return true; //debug
		},
		ownKeys: function(obj) {
			return Object.getOwnPropertyNames(scope.currentObject);
		},
		getOwnPropertyDescriptor: function (obj,prop) {
			return Object.getOwnPropertyDescriptor(scope.currentObject, prop);
		}
	});
	
	for (let k of Object.getOwnPropertyNames(this.proxy)) {
		let type = typeof this.proxy[k];
		if (["object", "array", "undefined"].includes(type)) continue;
		console.log("Trying to add field of type %s.",type);
		this.menu.add(this.proxy, k);
	}
	
	this.currentPos = {
		xCentre:0,
		yCentre:0,
		zBase:0
	};
	
	this.menu.add(this.currentPos, "xCentre").onChange(this.updatePosition);
	this.menu.add(this.currentPos, "yCentre").onChange(this.updatePosition);
	this.menu.add(this.currentPos, "zBase").onChange(this.updatePosition);
	
	//Dispose of temporary object
	this.currentObject = {};
	this.menu.updateDisplay();
}

ObjectMenu.prototype = Object.create(Object.prototype);
Object.assign(ObjectMenu.prototype, {
	constructor: ObjectMenu,
	updatePosition: function() {
		let [x,y,z] = [this.currentPos.xCentre, this.currentPos.yCentre, this.currentPos.zBase];
		this.currentObject.referenceState.xCentre = x;
		this.currentObject.referenceState.yCentre = y;
		this.currentObject.referenceState.zBase = z;
		if (this.ship3D) {
			let o3D = this.ship3D.blocks.getObjectById(this.currentObject.id);
			if (o3D) {
				o3D.position.set(x,y,z);
			}
		}
	}
});