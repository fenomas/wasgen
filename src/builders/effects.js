

import { createCrusher, isCrusher } from './crusher'
import { createShaper, isShaper } from './shapers'
import { createFilter, isFilter } from './filters'


/*
 * 
 *      Builds node for a single effect program
 *      Current possible effect types:
 *              wave shaper
 *              biquad filter
 *              or bit-crusher
 * 
*/


export function createEffect(ctx, type) {

    if (isCrusher(type)) return createCrusher(ctx, type)
    if (isShaper(type)) return createShaper(ctx, type)
    if (isFilter(type)) return createFilter(ctx, type)

    return null
}






