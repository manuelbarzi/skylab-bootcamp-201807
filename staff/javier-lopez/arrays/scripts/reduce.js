function reduce(array, func, init) {
    // TODO see Array.prototype.reduce to understand it. re-implement it here accepting array as parameter (use of Array.prototype.reduce is forbidden)
    var sum = 0;
    for(init; init<array.length;init++){
        sum = func(sum, array[init]);
    }
    return sum;
}