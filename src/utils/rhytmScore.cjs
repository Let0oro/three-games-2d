const rhythmScore = (metric) => {
  const maxMetricLine = Math.max(...metric.map((l) => l.length));

  const averageMetricLines =
    metric.reduce((a, c) => a + c.filter((v) => v).length, 0) / metric.length;

  const prepareBits = metric.map((l) =>
    l.join("").padEnd(maxMetricLine, 0).split("")
  );

  const calcBits = [...prepareBits]
    .reduce(
      (a, c) => (a[0] = a.map((b, i) => b & c[i])),
      Array(maxMetricLine).fill(1)
    )
    .filter((v) => v).length;

  const rhytmNames = {
    dos: { troqueo: [1, 0], yambo: [0, 1] },
    tres: { dactilo: [1, 0, 0], anfibraco: [0, 1, 0], anapesto: [0, 0, 1] },
  };

  const transformLength = (arr, number) =>
    arr.map((mArr, i) => {
      if (mArr.length % number)
        mArr = mArr.splice(0, mArr.length - (mArr.length % number));
      return mArr;
    });

  const divideIntoNumber = (arr, num) =>
    arr
      .map((v, i) => {
        if (v.length == num) return v;
        if (Array.isArray(v)) return divideIntoNumber(v, num);
        if (!((i + 1) % num)) {
          const newIndexSubst = i - (num - 1) < 0 ? 0 : i - (num - 1);
          const returned = [...arr].slice(newIndexSubst, i + 1);
          return returned;
        }
        return undefined;
      })
      .filter((v) => v);

  const compareRhytmWithArr = (arrComp, objComp) => {
    return arrComp.map((line) =>
      line
        .map((feet) =>
          Object.values(objComp)
            .map(
              (v, ix) => v.join("") == feet.join("") && Object.keys(objComp)[ix]
            )
            .filter((v) => v)
        )
        .map((arr) => (arr.length ? arr[0] : "--"))
    );
  };

  const twoFeets = (arr) => {
    const lengthFilteredArr = transformLength([...arr], 2);
    const twoArr = divideIntoNumber(lengthFilteredArr, 2);
    const resultKeys = compareRhytmWithArr(twoArr, rhytmNames.dos);
    return resultKeys;
  };
  const namesTwo = twoFeets(prepareBits);


  return { points: calcBits / averageMetricLines, name: namesTwo };
};

module.exports = rhythmScore;
