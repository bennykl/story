import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";
import css from "rollup-plugin-css-only";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "docs/build/bundle.js",
  },
  plugins: [
    svelte(),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    css({ output: "bundle.css" }),
    !production && serve("docs"),
    !production &&
      livereload({
        watch: "docs",
        port: 12345,
        delay: 300,
      }),
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
