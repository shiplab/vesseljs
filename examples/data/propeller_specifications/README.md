Propellers are linearized from Kt, Kq curves for expected working regime (that is, high efficiency region of the curves) with:

Kt = beta1 - beta2\*J

Kq = gamma1 - gamma2\*J

An example of propeller specification would be:
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
