//@EliasHasle

/*
The object state assignments could/should also have a baseByGroup. A group of baseObjects could for instance be a category including all tanks that carry a given compound, regardless of their size and shape. Maybe "group" is not a good name for something that can be set freely. Maybe "label" or "tag" or something else. The same goes for derivedByGroup.

With this, there would be five types of assignments:
common: All objects.
baseByGroup: Applies to every object that has its base object's property "group" set to the given name.
baseByID: Applies to all objects that have base object consistent with the given ID:
derivedByGroup: Applies to every object that has its property "group" set to the given name.
derivedByID: Applies only to the object with given ID.

Assignments of subsequent types override assignments of previous types.
*/

/*
The caching and version control is clumsy (and incomplete). I (Elias) have done some separate testing of ways to do it properly. This must be implemented later.
*/

/*
ShipState now mainly accounts for load state, by which I mean the states of objects in the ship. We need to find out how to best handle other state properties, like global position, heading etc., not to mention properties that change fast, and that depend on time and current state (motion fluctuations etc.).
*/

function ShipState(specification) {
    this.version = 0;
    this.objectCache = {};
    this.continuous = {};
    this.discrete = {};
    JSONSpecObject.call(this, specification);
}
ShipState.prototype = Object.create(JSONSpecObject.prototype);
Object.assign(ShipState.prototype, {
    constructor: ShipState,
    getSpecification: function () {
        if (this.cachedVersion !== this.version) {
            var spec = {
                calculationParameters: this.calculationParameters,
                objectOverrides: this.objectOverrides //{}
            };

            //Sketchy, but versatile:
            spec = JSON.parse(JSON.stringify(spec));

            this.specCache = spec;
            this.cachedVersion = this.version;
        }
        return this.specCache;
    },
    clone: function () {
        return new ShipState(this.getSpecification());
    },
    getObjectState: function (o) {
        if (this.objectCache[o.id] !== undefined) {
            let c = this.objectCache[o.id];
            if (c.thisStateVer === this.version
                /*&& c.baseStateVer === o.baseObject.baseStateVersion
                && c.refStateVer === o.referenceStateVersion*/
            ) {
                console.log("ShipState.getObjectState: Using cache.");
                return c.state;
            }
        }
        console.log("ShipState.getObjectState: Not using cache.");

        let state = {};
        Object.assign(state, o.baseObject.baseState);
        Object.assign(state, o.referenceState);
        let oo = this.objectOverrides;
        let sources = [oo.common, oo.baseByID[o.baseObject.id], oo.derivedByGroup[o.affiliations.group], oo.derivedByID[o.id]];
        for (let i = 0; i < sources.length; i++) {
            let s = sources[i];
            if (!s) continue;
            let sk = Object.keys(s);
            for (let k of sk) {
                //Override existing properties only:
                if (state[k] !== undefined) {
                    state[k] = s[k];
                }
            }
        }

        this.objectCache[o.id] = {
            thisStateVer: this.version,
            /*baseStateVer: o.baseObject.baseStateVersion,
            refStateVer: o.referenceStateVersion,*/
            state: state
        };

        return state;
    },
    //o is an object, k is a key to a single state property
    getObjectStateProperty: function (o, k) {
        return this.getObjectState(o)[k];
        //I have commented out a compact, but not very efficient, implementation of Alejandro's pattern, that does not fit too well with my caching solution.
        /*		let oo = this.objectOverrides;
        		let sources = [oo.derivedByID[o.id], oo.derivedByGroup[o.affiliations.group], oo.baseByID[o.baseObject.id], oo.common, o.getReferenceState(), o.baseObject.getBaseState()].filter(e=>!!e);
        		for (let i = 0; i < sources.length; i++) {
        			if (sources[i][k] !== undefined) return sources[i][k];
        		}
        		return; //undefined*/
    },
    //Sets this state exclusively from parameter.
    setFromSpecification: function (spec) {
        this.objectCache = {}; //reset cache
        if (!spec) {
            Object.assign(this, {
                calculationParameters: {},
                //Named overrides because only existing corresponding properties will be set
                objectOverrides: {
                    commmon: {},
                    //baseByGroup: {},
                    baseByID: {},
                    derivedByGroup: {},
                    derivedByID: {}
                }
            });
            return;
        }

        this.calculationParameters = spec.calculationParameters || {};
        this.objectOverrides = {};
        let oo = this.objectOverrides;
        let soo = spec.objectOverrides || {};
        oo.common = soo.common || {};
        oo.baseByID = soo.baseByID || {};
        oo.derivedByGroup = soo.derivedByGroup || {};
        oo.derivedByID = soo.derivedByID || {};

        this.version++;

        return this;
    },
    //Overrides existing directives and adds new ones.
    extend: function (spec) {
        Object.assign(this.calculationParameters, spec.calculationParameters);
        this.calculatedProperties = {};
        let oo = this.objectOverrides;
        let soo = spec.objectOverrides || {};
        Object.assign(oo.common, soo.common);
        let sources = [soo.baseByID, soo.derivedByGroup, soo.derivedByID];
        let targets = [oo.baseByID, oo.derivedByGroup, oo.derivedByID];
        for (let i = 0; i < sources.length; i++) {
            if (!sources[i]) continue;
            let sk = Object.keys(sources[i]);
            for (let k of sk) {
                if (targets[i][k] !== undefined) {
                    Object.assign(targets[i][k], sources[i][k]);
                } else {
                    targets[i][k] = sources[i][k];
                }
            }
        }

        this.version++;
    },
    //Applies only directives of spec that have a corresponding directive in this.
    override: function (spec) {
        let oo = this.objectOverrides;
        let soo = spec.objectOverrides;

        let sources = [spec.calculationParameters, soo.common];
        let targets = [this.calculationParameters, oo.common];
        for (let i = 0; i < sources.length; i++) {
            if (!sources[i]) continue;
            let sk = Object.keys(sources[i]);
            for (let k of sk) {
                if (targets[i][k] !== undefined) {
                    targets[i][k] = sources[i][k];
                }
            }
        }

        sources = [soo.common, soo.baseByID, soo.derivedByGroup, soo.derivedByID];
        targets = [oo.common, oo.baseByID, oo.derivedByGroup, oo.derivedByID];

        for (let i = 0; i < sources.length; i++) {
            if (!sources[i]) continue;
            let specKeys = Object.keys(sources[i]);
            for (let key of specKeys) {
                if (targets[i][key] !== undefined) {
                    let t = targets[i][key];
                    let s = sources[i][key];
                    if (!s) continue;
                    let sk = Object.keys(s);
                    //Loop over individual properties in assignments, and override only:
                    for (let k of sk) {
                        if (t[k] !== undefined) {
                            t[k] = s[k];
                        }
                    }
                }
            }
        }

        this.version++;
    }
});