export const findLineByLeastSquares = (
  values_x: number[],
  values_y: number[]
): { m: number; b: number } => {
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var count = 0;

  // We'll use those variables for faster read/write access.
  var x = 0;
  var y = 0;
  var values_length = values_x.length;

  if (values_length != values_y.length) {
    throw new Error(
      "The parameters values_x and values_y need to have same size"
    );
  }

  // Nothing to do.
  if (values_length === 0) {
    throw new Error("No values provided");
  }

  // Calculate the sum for each of the parts necessary.
  for (var v = 0; v < values_length; v++) {
    x = values_x[v];
    y = values_y[v];
    sum_x += x;
    sum_y += y;
    sum_xx += x * x;
    sum_xy += x * y;
    count++;
  }

  /*
   * Calculate a and b for the formula:
   * y = m * a + b
   */
  const m = (count * sum_xy - sum_x * sum_y) / (count * sum_xx - sum_x * sum_x);
  const b = sum_y / count - (m * sum_x) / count;

  return { m, b };
};
