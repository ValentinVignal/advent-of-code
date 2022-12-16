# advent-of-code


## Installation

```bash
npm i
```

## Run a file

```bash
npm run run src/{year}/{day}/{part}.ts
```

## Download the .txt file

Open the browser console on the puzzle input page and run the following code:

```js
function download() {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(document.querySelector('body > pre').innerText));
  element.setAttribute('download', 'input.txt');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
download();
```
