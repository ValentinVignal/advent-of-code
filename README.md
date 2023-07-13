# advent-of-code

[![wakatime](https://wakatime.com/badge/user/a700230c-ba51-4378-8fbc-fbcb542401ed/project/c93eb0f3-1c1c-4a6e-b811-aee703bdd215.svg)](https://wakatime.com/badge/user/a700230c-ba51-4378-8fbc-fbcb542401ed/project/c93eb0f3-1c1c-4a6e-b811-aee703bdd215)


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
