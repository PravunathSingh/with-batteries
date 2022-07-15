# with-batteries

A CLI tool for generating React and Next apps with all the neccessary batteries (packages) included. It's also come with Typescript support out of the box. It's a great way to start your next project.

The package contains 4 directories like so:

- `Next with TypeScript` (batteries included)
- `Next with JavaScript` (batteries included)
- `React with TypeScript` (batteries included) **`created using Vite`**
- `React with JavaScript` (batteries included) **`created using Vite`**

## Installation

- In your terminal, run:

```
npx with-batteries name-of-your-project
```

- Then choose from one of the templates.
- Finally choose your preferred variant and run:

```
cd name-of-your-project
npm install or yarn
npm run dev or yarn run dev
```

## Included Batteries:

- For **React**

  - `Axios`
  - `React Router`
  - `React Query`
  - `Tailwind` (with a predefined config file)
  - `Eslint Config React App` (to give you linting similar to create-react-app)
  - Configured with `ScrollToTop` utility, more info can be found in `App.jsx/tsx` file in `src` directory.

  For more info regarding the various dependencies please refer to the `package.json`

- For **Next**
  - `Axios`
  - `React Query`
  - `Tailwind` (with a predefined config file)
  - `eslint-plugin-react`
  - `Types required for the TypeScript variant`
    The `.eslintrc` file has also been provided with a starter template.
  For more info regarding the various dependencies please refer to the `package.json`

## NOTE:

The **React** templates are not provided with a `README` file. You can add one after scafolding the project.

## TODO

- Add **Storybook** templates
- Add **Testing** to the existing as well as upcoming templates.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Authors

- [@PravunathSingh](https://www.github.com/PravunathSingh)
