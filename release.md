### Upgrade Cadence and Proof

Upgrade Cadence and upgrade Proof because it now uses the latest Cadence. The
latest Cadence has the concept of an arrayed return, the array elements are the
parameters to the subsequent step. Some of the Proof tests in Riffle were
returning arrays, so they needed to be updated to return the array in an array,
so that the array would be a single parameter, as opposed to having it's
elements used as a parameter.

### Issue by Issue

 * Upgrade Cadence to 0.0.41. #52.
 * Upgrade Strata to 0.0.26. #51.
 * Upgrade Proof to 0.0.48. #50.
 * Upgrade Cadence to 0.0.40. #48.
 * Upgrade Strata to 0.0.23. #47.
 * Upgrade Proof to 0.0.47. #46.
 * Upgrade Strata to 0.0.17. #44.
 * Upgrade Proof to 0.0.44. #43.
 * Do not use Cadence exposed by Proof. #42.
 * Upgrade Cadence to 0.0.36. #41.
 * Remove "url" from `package.json`. #38.
 * Upgrade Proof to 0.0.42. #37.
 * Upgrade Cadence to 0.0.35. #36.
 * Remove `this.terminated`. #34.
