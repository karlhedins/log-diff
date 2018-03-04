import diff from 'deep-diff';

// Styling
const propDefaults = `
padding: 0.2rem;
border-radius: 0.2rem;
`;

const mediumText = `
font-size: 12px;
`;

const largeText = `
font-size: 13px;
`;

const redBackground = `
color: #24292e;
background-color: #fdb8c0;
`;

const greenBackground = `
color: #24292e;
background-color: #acf2bd;
`;

/*
Formats values:
* Adds qoutes around strings
* Stringifies objects
*/
const formatValue = (value) => {
  const type = typeof value;
  switch (type) {
    case 'string':
      return `'${value}'`;
    case 'object':
      return JSON.stringify(value, null, '  ');
    default:
      return value;
  }
};

// console.log wrapper with styling
const log = (str, ...styling) => {
  if (!styling || styling.length === 0) {
    console.log(str);
  } else {
    console.log(`%c${str}`, styling.join(''));
  }
};

/*
propPath [added]
+ value *green*
*/
const logAdded = (diffObj) => {
  const propPath = diffObj.path.join('.');
  log(`${propPath} [added]`, mediumText);
  log(`+ ${formatValue(diffObj.rhs)}`, greenBackground, mediumText, propDefaults);
};

/*
propPath [deleted]
- value *red*
*/
const logDeleted = (diffObj) => {
  const propPath = diffObj.path.join('.');
  log(`${propPath} [deleted]`, mediumText);
  log(`- ${formatValue(diffObj.lhs)}`, redBackground, mediumText, propDefaults);
};

/*
propPath [edited]
- value *red*
+ value *green*
*/
const logEdited = (diffObj) => {
  // Changes to one element in an array gets detected as a property change by deep-diff
  // To detect this special case the last element in the property path will be a number
  const [last] = diffObj.path.slice(-1);
  const isArrayEdit = typeof last === 'number';

  let changeKind;
  let arrayEditPrefix;
  let propPath;
  if (isArrayEdit) {
    changeKind = '[Array element edited]';
    arrayEditPrefix = `[${last}] `;
    // Skip last element of the propPath since it's the array index
    propPath = diffObj.path.slice(0, -1).join('.');
  } else {
    changeKind = '[edited]';
    arrayEditPrefix = '';
    propPath = diffObj.path.join('.');
  }

  log(`${propPath} ${changeKind}`, mediumText);
  log(`- ${arrayEditPrefix}${formatValue(diffObj.lhs)}`, redBackground, mediumText, propDefaults);
  log(`+ ${arrayEditPrefix}${formatValue(diffObj.rhs)}`, greenBackground, mediumText, propDefaults);
};


/*
propPath [Array element added]
+ [i] value *green*
*/
const logArrayChangeAdded = (diffObj) => {
  const propPath = diffObj.path.join('.');
  log(`${propPath} [Array element added]`, mediumText);
  log(`+ [${diffObj.index}] ${formatValue(diffObj.item.rhs)}`, greenBackground, mediumText, propDefaults);
};

/*
propPath [Array element deleted]
+ [i] value *red*
*/
const logArrayChangeDeleted = (diffObj) => {
  const propPath = diffObj.path.join('.');
  log(`${propPath} [Array element deleted]`, mediumText);
  log(`- [${diffObj.index}] ${formatValue(diffObj.item.lhs)}`, redBackground, mediumText, propDefaults);
};

const logArrayChangeKind = {
  N: logArrayChangeAdded,
  D: logArrayChangeDeleted,
};

const logArrayChange = (diffObj) => {
  logArrayChangeKind[diffObj.item.kind](diffObj);
};

const logChangeKind = {
  N: logAdded,
  D: logDeleted,
  E: logEdited,
  A: logArrayChange,
};

export default function logDiff(lhs, rhs) {
  let differences = diff(lhs, rhs);

  log('=== logDiff ...', largeText);

  if (differences) {
    // Skip functions
    differences = differences.filter(diffObj =>
      typeof diffObj.lhs !== 'function' &&
      typeof diffObj.rhs !== 'function');

    differences.forEach((difference) => {
      logChangeKind[difference.kind](difference);
    });
  } else {
    console.log('Objects are identical!');
  }

  log('===', largeText);
}
