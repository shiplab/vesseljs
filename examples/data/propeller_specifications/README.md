A propeller object defines physical characteristics, namely: number of propellers, number of blades, diameter and expanded area ratio. Furthermore, efficiency data is linearized from Kt, Kq curves for expected working regime (that is, high efficiency region of the curves), with:

Kt = beta1 - beta2\*J

Kq = gamma1 - gamma2\*J

Linearization coefficients are included as properties of a propeller object. An example of propeller specification would be:
```json
{
	"noProps": 2,
	"noBlades": 4,
	"D": 3,
	"P": 1.2,
	"AeAo": 0.55,
	"beta1": 0.57,
	"beta2": 0.44,
	"gamma1": 0.105,
	"gamma2": 0.077
}
```

Suggestions for improvement in the future:
* approximate curves with higher order polynomials.
* create a script to automatically generate propeller specifications.
* create a propeller constructor/prototype with methods for controlling pitch.
