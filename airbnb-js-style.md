#AirBNB JS Style Guideline - Shortened Version
[Source](https://github.com/airbnb/javascript#objects)

##References
- 2.1 Use const for all of your references; avoid using var.
- 2.2 If you must mutate references, use let instead of var.
- 2.3 Note that both let and const are block-scoped.

##Objects
- 3.1 Use the literal syntax for object creation.
- 3.4 Use computed property names when creating objects with dynamic property names. They allow you to define all the properties of an object in one place.

```
  function getKey(k) {
    return `a key named ${k}`;
  }

  // bad
  const obj = {
    id: 5,
    name: 'San Francisco',
  };
  obj[getKey('enabled')] = true;

  // good
  const obj = {
    id: 5,
    name: 'San Francisco',
    [getKey('enabled')]: true,
  };
```
- 3.5 Use object method shorthand.
```
const atom = {
  value: 1,

  addValue(value) {
    return atom.value + value;
  },
};

```
- 3.6 Use property value shorthand. It is shorter to write and descriptive.
```
  const lukeSkywalker = 'Luke Skywalker';

  // bad
  const obj = {
    lukeSkywalker: lukeSkywalker
  };

  // good
  const obj = {
    lukeSkywalker
  };
```
- 3.7 Group your shorthand properties at the beginning of your object declaration.

##Arrays
- 4.3 Use array spreads ... to copy arrays.
- 4.4 To convert an array-like object to an array, use Array#from.
```
const foo = document.querySelectorAll('.foo');
const nodes = Array.from(foo);
```

##Destructuring
- 5.1 Use object destructuring when accessing and using multiple properties of an object. Destructuring saves you from creating temporary references for those properties.
```
  // bad
  function getFullName(user) {
    const firstName = user.firstName;
    const lastName = user.lastName;

    return `${firstName} ${lastName}`;
  }

  // good
  function getFullName(obj) {
    const { firstName, lastName } = obj;
    return `${firstName} ${lastName}`;
  }

  // best
  function getFullName({ firstName, lastName }) {
    return `${firstName} ${lastName}`;
  }
```
- 5.2 Use array destructuring.
```
const arr = [1, 2, 3, 4];

// bad
const first = arr[0];
const second = arr[1];

// good
const [first, second] = arr;
```
- 5.3 Use object destructuring for multiple return values, not array destructuring. You can add new properties over time or change the order of things without breaking call sites.

```
// bad
  function processInput(input) {
    // then a miracle occurs
    return [left, right, top, bottom];
  }

  // the caller needs to think about the order of return data
  const [left, __, top] = processInput(input);

  // good
  function processInput(input) {
    // then a miracle occurs
    return { left, right, top, bottom };
  }

  // the caller selects only the data they need
  const { left, right } = processInput(input);
```

##Strings
- 6.1 Use single quotes '' for strings.
- 6.2 Strings longer than 80 characters should be written across multiple lines using string concatenation.
- 6.3 Note: If overused, long strings with concatenation could impact performance.
```
// good
const errorMessage = 'This is a super long error that was thrown because ' +
  'of Batman. When you stop to think about how Batman had anything to do ' +
  'with this, you would get nowhere fast.';
```
- 6.4 When programmatically building up strings, use template strings instead of concatenation. Template strings give you a readable, concise syntax with proper newlines and string interpolation features.
```
  // bad
  function sayHi(name) {
    return 'How are you, ' + name + '?';
  }

  // bad
  function sayHi(name) {
    return ['How are you, ', name, '?'].join();
  }

  // good
  function sayHi(name) {
    return `How are you, ${name}?`;
  }
```
- 7.1 Use function declarations instead of function expressions. Function declarations are named, so they are easier to identify in call stacks. Also, the whole body of a function declaration is hoisted, whereas only the reference of a function expression is hoisted. This rule makes it possible to always use Arrow Functions in place of function expressions.
```
  // bad
  const foo = function () {
  };

  // good
  function foo() {
  }
```
- 7.2 Function expressions:
```
// immediately-invoked function expression (IIFE)
(() => {
  console.log('Welcome to the Internet. Please follow me.');
})();
```
- 7.3 Never declare a function in a non-function block (if, while, etc). Assign the function to a variable instead. Browsers will allow you to do it, but they all interpret it differently, which is bad news bears.
- 7.4 Note: ECMA-262 defines a block as a list of statements. A function declaration is not a statement. Read ECMA-262 note on this issue.
```
// bad
if (currentUser) {
  function test() {
    console.log('Nope.');
  }
}

// good
let test;
if (currentUser) {
  test = () => {
    console.log('Yup.');
  };
}
```
- 7.5 Never name a parameter arguments. This will take precedence over the arguments object that is given to every function scope.
- 7.6 Never use `arguments`, opt to use rest syntax ... instead. ... is explicit about which arguments you want pulled. Plus rest arguments are a real Array and not Array-like like arguments.
```
  // bad
  function concatenateAll() {
    const args = Array.prototype.slice.call(arguments);
    return args.join('');
  }

  // good
  function concatenateAll(...args) {
    return args.join('');
  }
```
- 7.7 Use default parameter syntax rather than mutating function arguments.
```
// really bad
function handleThings(opts) {
  // No! We shouldn't mutate function arguments.
  // Double bad: if opts is falsy it'll be set to an object which may
  // be what you want but it can introduce subtle bugs.
  opts = opts || {};
  // ...
}

// still bad
function handleThings(opts) {
  if (opts === void 0) {
    opts = {};
  }
  // ...
}

// good
function handleThings(opts = {}) {
  // ...
}
```
##Arrow Functions
- 8.1 When you must use function expressions (as when passing an anonymous function), use arrow function notation. It creates a version of the function that executes in the context of this, which is usually what you want, and is a more concise syntax. Why not? If you have a fairly complicated function, you might move that logic out into its own function declaration.
```
  // bad
  [1, 2, 3].map(function (x) {
    return x * x;
  });

  // good
  [1, 2, 3].map((x) => {
    return x * x;
  });
```
- 8.2 If the function body fits on one line, feel free to omit the braces and use implicit return. Otherwise, add the braces and use a return statement.
- 8.3 Always use parentheses around the arguments. Omitting the parentheses makes the functions less readable and only works for single arguments. These declarations read better with parentheses. They are also required when you have multiple parameters so this enforces consistency.
```
  // bad
  [1, 2, 3].map(x => x * x);

  // good
  [1, 2, 3].map((x) => x * x);
```

##Iterators and Generators
- 11.1 Do not use iterators. Prefer JavaScript higher-order functions like map() and reduce() instead of loops like for-of.This enforces our immutable rule. Dealing with pure functions that return values is easier to reason about than side-effects.
```
  const numbers = [1, 2, 3, 4, 5];

  // bad
  let sum = 0;
  for (let num of numbers) {
    sum += num;
  }

  sum === 15;

  // good
  let sum = 0;
  numbers.forEach((num) => sum += num);
  sum === 15;

  // best (use the functional force)
  const sum = numbers.reduce((total, num) => total + num, 0);
  sum === 15;
```
- 11.2 Do not use generators for now. Why? They do not transpile well to ES5. (ARE FOR IN LOOPS GENERATORS???)

##Properties
- 12.1 Use dot notation when accessing properties.
```
const luke = {
  jedi: true,
  age: 28,
};

// bad
const isJedi = luke['jedi'];

// good
const isJedi = luke.jedi;
```
- 12.2 Use subscript notation [] when accessing properties with a variable.
```
const luke = {
  jedi: true,
  age: 28,
};

function getProp(prop) {
  return luke[prop];
}

const isJedi = getProp('jedi');
```
- 13.2 Use one const declaration per variable.
- 13.3 Group all your consts and then group all your lets.















