class checkerMax {
  constructor(value_max) {
    this.value_max = value_max;
  }

  check(threshold) {
    return threshold > this.value_max ? 1 : 0;
  }
}

class checkerMin {
  constructor(value_min) {
    this.value_min = value_min;
  }

  check(threshold) {
    return threshold < this.value_min;
  }
}

class checkerOutside {
  constructor(value_min, value_max) {
    this.value_min = value_min;
    this.value_max = value_max;
  }

  check(threshold) {
    return threshold < this.value_min || threshold > this.value_max;
  }
}

class checkerBetween {
  constructor(value_min, value_max) {
    this.value_min = value_min;
    this.value_max = value_max;
  }

  check(threshold) {
    return threshold > this.value_min && threshold < this.value_max;
  }
}

class checkerNoValue {
  check(threshold) {
    return threshold === null;
  }
}

module.exports = {
  checkerMax,
  checkerMin,
  checkerOutside,
  checkerBetween,
  checkerNoValue,
};
