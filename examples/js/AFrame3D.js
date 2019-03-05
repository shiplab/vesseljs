function AFrame3D(aFrame) {
    THREE.Group.call(this);

    this.aFrame = aFrame;

    var frameGroup = new THREE.Group();

    var geometry1 = new THREE.CylinderGeometry(aFrame.radiusVert, aFrame.radiusVert, aFrame.height, 32);
    var material = new THREE.MeshBasicMaterial({
        color: 0xffff00
    });
    var cylinder1 = new THREE.Mesh(geometry1, material);

    cylinder1.position.y = aFrame.span / 2;
    cylinder1.position.z = aFrame.height / 2;
    cylinder1.rotation.x = Math.PI / 2;

    frameGroup.add(cylinder1);

    var cylinder2 = new THREE.Mesh(geometry1, material);

    cylinder2.position.y = -aFrame.span / 2;
    cylinder2.position.z = aFrame.height / 2;
    cylinder2.rotation.x = Math.PI / 2;

    frameGroup.add(cylinder2);

    var geoSpan = aFrame.span - 2 * aFrame.radiusVert;
    var geometry2 = new THREE.CylinderGeometry(aFrame.radiusHor, aFrame.radiusHor, geoSpan, 32);
    var cylinder3 = new THREE.Mesh(geometry2, material);

    cylinder3.position.z = aFrame.height - aFrame.radiusHor;

    frameGroup.add(cylinder3);

    this.add(frameGroup);
}

AFrame3D.prototype = Object.create(THREE.Group.prototype);