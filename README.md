# Node.js Variable Memory Simulator

An interactive, dependency-free simulator for explaining how JavaScript and
Node.js variables behave in memory.

The app visualizes:

- primitive value copying
- object reference copying
- stack frames and local bindings
- heap objects and mutations
- function arguments
- `const` binding behavior
- closures retaining environments

## Project Structure

```text
.
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── index.html
└── README.md
```

## Run Locally

Open `index.html` directly in a browser, or serve the folder with any static
server:

```bash
python3 -m http.server 4173
```

Then visit:

```text
http://localhost:4173
```

## Deploy With GitHub Pages

This repo includes a GitHub Actions workflow that publishes the static site to
GitHub Pages.

1. Create a new GitHub repository.
2. Push this local repository to it.
3. In GitHub, go to **Settings -> Pages**.
4. Set **Source** to **GitHub Actions**.
5. Push to `main`; the workflow will deploy the site.

## Teaching Notes

JavaScript is pass-by-value. The subtle part is that object values are
references. When a function receives an object argument, it receives a copy of
the reference, not a copy of the object.

That means:

- reassigning a primitive parameter does not change the caller's variable
- mutating an object through a copied reference changes the shared heap object
- `const` prevents rebinding, but it does not freeze object contents
